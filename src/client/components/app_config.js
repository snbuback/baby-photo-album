import ClientOAuth2 from 'client-oauth2';
import {plugins, request} from 'popsicle';
import { Album, Photo, Video } from '../api/model';
import Promise from "promise";
import Cache from "../cache.js";

/**
 * Contains all Api and app parameters
 */
class AppConfig {
    AUTH_CACHE_KEY = '__auth_token';
    constructor() {
        this.cache = new Cache();
        this._signer = null;
        this._baseurl = 'https://graph.microsoft.com/v1.0';
        this._oauth2 = new ClientOAuth2({
            clientId: '9e604212-02cc-44e3-848a-33b7af8ae523',
            // clientSecret: '123',
            // accessTokenUri: 'https://github.com/login/oauth/access_token',
            authorizationUri: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            redirectUri: window.location.origin + '/',
            scopes: ['user.read', 'files.read', 'files.read.all', 'sites.read.all', 'sites.readwrite.all', 'files.readwrite.all']
        });
    }

    _setup(signer) {
        this._signer = signer;
    }

    _authenticate() {
        this.cache.clear();
        let url = this._oauth2.token.getUri();
        console.debug(`no authentication... redirecting to ${url}`);
        // redirect to authenticate
        window.location = url;
    }

    getAuthStatus(callback) {
        if (this._signer !== null) {
            console.debug('already authenticated');
            callback(true);
            return;
        }

        // check localStore
        let keyStorage = this.cache.get(this.AUTH_CACHE_KEY);
        if (keyStorage) {
            this._setup({accessToken: keyStorage});
            callback(true);
            return;
        }

        const failed = () => {
            this._authenticate();
            callback(false);
        };
        const success = (signer) => {
            this.cache.set(this.AUTH_CACHE_KEY, signer.accessToken);
            this._setup(signer);
            callback(true);
        };

        const url = window.location.toString();
        this._oauth2.token.getToken(url).then(
            (signer) => {
                if (signer && signer.accessToken) {
                    // clear token in URL
                    window.location.hash = '';
                    success(signer);
                } else {
                    failed();
                }
            },
            () => {
                failed();
            }
        );
    }

    _request(method, url, body, json) {
        let response = request({
            method: method,
            url: this._baseurl + '/drives/e4876de43fa0da3' + url,
            body: body,
            headers: {'Authorization': 'Bearer ' + this._signer.accessToken}
        });

        if (json) {
            response = response.use(plugins.parse('json'));
        }
        return response.then((response) => {
            if (response.status == 401) {
                this._authenticate();
                return null;
            }
            if (response.status != 200) {
                throw `Invalid status code: ${json.status}`;
            }
            return response;
        });
    }

    get(url, json=true) {
        return this._request('GET', url, null, json);
    }

    put(url, body, json=true) {
        return this._request('PUT', url, body, json);
    }

    patch(url, body, json=true) {
        return this._request('PATCH', url, body, json);
    }

    async getAlbums() {
        return this.cache.asyncGetOrSet('albums', () => {
            // TODO pending support pagination with @odata.nextLink parameter
            return this.get('/items/E4876DE43FA0DA3!27069?expand=thumbnails,children(expand=thumbnails(select=large))').then(
                (json) => {
                    const folders = json.body.children;
                    return folders;
                }
            );
        }).then((folders) => {
            folders = folders.sort((folderA, folderB) => (folderA.name.localeCompare(folderB.name)));
            return folders.filter((element) => 'folder' in element).map((element) => {
                const albumId = element.id;
                const albumName = element.description || element.name;
                let coverPhoto = null;
                if (element.thumbnails && element.thumbnails.length > 0) {
                    coverPhoto = new Photo({
                        albumId: albumId,
                        id: `thumb-${albumId}`,
                        image: element.thumbnails[0]['large'].url
                    });
                }
                return new Album(albumId, albumName, coverPhoto);
            });
        });
    }

    async _getDirectoryListing(albumId) {
        return this.cache.asyncGetOrSet(`album-${albumId}`, 
            () => this.get(`/items/${albumId}/children?expand=thumbnails`).then(
                (json) => {
                    const directoryListing = json.body.value;
                    // TODO pending support pagination with @odata.nextLink parameter
                    return directoryListing;
                }
            )
        );
    }

    async _getComments(albumId, _directoryListing=null) {
        return this.cache.asyncGetOrSet(`comments-${albumId}`, 
        () => (_directoryListing ? Promise.resolve(_directoryListing) : this._getDirectoryListing(albumId)).then(
                (directoryListing) => {
                    const element = directoryListing.find((e) => e.name == 'comments.json');
                    if (element) {
                        return this.get(`/items/${element.id}/content`).then((content) => {
                            return content.body || {};
                        });
                    }
                    return {};
                }
        ));
    }

    async updatePhotoTitle(photo, title) {
        return this._getDirectoryListing(photo.albumId).then(
            (directoryListing) => {
                const element = directoryListing.find((e) => e.name == photo.id);
                if (!element) {
                    throw `Invalid photo reference: ${photo.id}`;
                }
                return element;
            }
        ).then(
            (element) => {
                return this.patch(`/items/${element.id}`, {description: title}, true);
            }
        ).finally(() => this.cache.del(`album-${photo.albumId}`));
    }

    async updatePhotoComment(photo, comment) {
        const albumId = photo.albumId;
        // get all comments and update only the required
        return this._getDirectoryListing(albumId).then(
            (directoryListing) => {
                const element = directoryListing.find((e) => e.name == 'comments.json');
                let uploadUrl = null;
                if (element) {
                    uploadUrl = `/items/${element.id}/content`;
                } else {
                    uploadUrl = `/items/${albumId}:/comments.json:/content`;
                }
                return uploadUrl;
            }
        ).then((uploadUrl) => {
            return this._getComments(albumId).then(
                (comments) => {
                    comments[photo.id] = comment;
                    this.put(uploadUrl, JSON.stringify(comments)).then(() => {
                        // update cache
                        this.cache.set(`comments-${albumId}`, comments);
                    });
            });
        });
    }

    async getPhotos(albumId) {
        return this._getDirectoryListing(albumId).then((directoryListing) => {
            return this._getComments(albumId, directoryListing).then((comments) => {
                return {
                    directoryListing: directoryListing,
                    comments: comments
                };
            });
        }).then(({directoryListing, comments}) => {
            console.log('directoryListing', directoryListing);
            // filtering photos
            return directoryListing.filter((e) => e['photo'] || e['video']).map((element) => {
                // check if is photo or video
                const photoId = element.name;
                const photoTitle = element.description;
                const taken = (element.photo && element.photo.takenDateTime) || element.fileSystemInfo.createdDateTime || element.createdDateTime;
                let thumb = null;
                if (element.thumbnails && element.thumbnails.length > 0) {
                    thumb = element.thumbnails[0]['large'];
                }
                let photoImg = thumb && thumb.url;

                const mimeType = element.file.mimeType || '';
                if (mimeType.startsWith('video/')) {
                    let play = element['@microsoft.graph.downloadUrl'];
                    let height = (element.video.height && element.video.height) && (thumb && thumb.height);
                    let width = (element.video.width && element.video.width) && (thumb && thumb.width);
                    return new Video({
                        albumId: albumId,
                        id: photoId,
                        title: photoTitle,
                        image: photoImg,
                        mimeType: mimeType,
                        play: play,
                        height: height,
                        width: width,
                        taken: taken ? new Date(taken) : null,
                        comment: comments[photoId]
                    });
        
                } else if (mimeType.startsWith('image/')) {
                    let height = (element.image && element.image.height) && (thumb && thumb.height);
                    let width = (element.image && element.image.width) && (thumb && thumb.width);
                    return new Photo({
                        albumId: albumId,
                        id: photoId,
                        title: photoTitle,
                        image: photoImg,
                        mimeType: mimeType,
                        height: height,
                        width: width,
                        taken: taken ? new Date(taken) : null,
                        comment: comments[photoId]
                    });
                }

            });
        }).then((photos) => {
            // remove unhandled mimetypes and sort by date
            photos.filter((e) => e).sort((photoA, photoB) => (photoA.taken || 0) - (photoB.taken || 0));
            console.debug(`From ${albumId}`, photos);
            return photos;
        });
    }
}

// singleton reference to AppConfig
const appConfig = new AppConfig();

window.appConfig = appConfig;

export default appConfig;