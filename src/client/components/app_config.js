/* global Map */
import ClientOAuth2 from 'client-oauth2';
import {plugins, request} from 'popsicle';
import { Album, Photo } from '../api/model';
import Promise from "promise";

class Cache {
    STORAGE_KEY = 'storageCache';
    constructor() {
        this._map = new Map();
        this._load();
    }

    _load() {
        let raw_content = window.localStorage.getItem(this.STORAGE_KEY);
        if (raw_content) {
            this._map = new Map(JSON.parse(raw_content));
        }
    }

    _persist() {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this._map]));
    }

    clear() {
        this._map.clear();
        this._persist();
    }

    get(key) {
        return this._map.get(key);
    }

    getOrSet(key, func) {
        let value = this.get(key);
        if (value === undefined) {
            value = func();
            this.set(key, value);
        }
        return value;
    }

    async asyncGetOrSet(key, func) {
        let value = this.get(key);
        if (value === undefined) {
            value = func().then((result) => {
                this.set(key, result);
                return result;
            });
        } else {
            value = new Promise.resolve(value);
        }
        return value;
    }

    set(key, value) {
        if (value === null || value == undefined) {
            this.del(key);
        } else {
            this._map.set(key, value);
        }
        this._persist();
        return value;
    }

    del(key) {
        this._map.delete(key);
        this._persist();
        return this;
    }
}

/**
 * Contains all Api and app parameters
 */
class AppConfig {
    AUTH_CACHE_KEY = 'auth_token';
    constructor() {
        this.cache = new Cache();
        this._signer = null;
        this._baseurl = 'https://graph.microsoft.com/v1.0';
        this._oauth2 = new ClientOAuth2({
            clientId: '9e604212-02cc-44e3-848a-33b7af8ae523',
            // clientSecret: '123',
            // accessTokenUri: 'https://github.com/login/oauth/access_token',
            authorizationUri: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            redirectUri: 'http://localhost:3000/',
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
            console.debug('authenticated', signer);
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
            url: this._baseurl + url,
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
            return this.get('/me/drive/root:/Photos:?expand=thumbnails,children(expand=thumbnails(select=large))').then(
                (json) => {
                    const folders = json.body.children;
                    console.debug('folders=', folders);
                    return folders;
                }
            );
        }).then((folders) => {
            return folders.filter((element) => element.name.search(/baby/i) !== -1).map((element) => {
                const albumId = element.id;
                const albumName = element.name;
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
            () => this.get(`/me/drive/items/${albumId}/children?expand=thumbnails`).then(
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
                        return this.get(`/me/drive/items/${element.id}/content`).then((content) => {
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
                return this.patch(`/me/drive/items/${element.id}`, {description: title}, true);
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
                    uploadUrl = `/me/drive/items/${element.id}/content`;
                } else {
                    uploadUrl = `/me/drive/items/${albumId}:/comments.json:/content`;
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
            return directoryListing.filter((e) => e['photo']).map((element) => {
                const photoId = element.name;
                const photoTitle = element.description;
                const height = element.image && element.image.height;
                const width = element.image && element.image.width;
                const taken = (element.photo && element.photo.takenDateTime) || element.createdDateTime;
                let photoImg = null;
                if (element.thumbnails && element.thumbnails.length > 0) {
                    photoImg = element.thumbnails[0]['large'].url;
                }
                return new Photo({
                    albumId: albumId,
                    id: photoId,
                    title: photoTitle,
                    image: photoImg,
                    height: height,
                    width: width,
                    taken: taken ? new Date(taken) : null,
                    comment: comments[photoId]
                });
            });
        }).then((photos) => {
            // sort by date
            photos.sort((photoA, photoB) => (photoB.taken || 0) - (photoA.taken || 0));
            console.debug(`Photos from ${albumId}`, photos);
            return photos;
        });
    }
}

// singleton reference to AppConfig
const appConfig = new AppConfig();

window.appConfig = appConfig;

export default appConfig;