import ClientOAuth2 from 'client-oauth2';
import {plugins, request} from 'popsicle';
import { Album, Photo } from '../api/model';

/**
 * Contains all Api and app parameters
 */
class AppConfig {
    constructor() {
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

    getAuthStatus(callback) {
        if (this._signer !== null) {
            console.debug('already authenticated');
            callback(true);
            return;
        }

        // check localStore
        let keyStorage = window.localStorage.getItem('key');
        if (keyStorage) {
            this._setup({accessToken: keyStorage});
            callback(true);
            return;
        }

        const failed = () => {
            let url = this._oauth2.token.getUri();
            console.debug(`no authentication... redirecting to ${url}`);
            // redirect to authenticate
            window.location = url;
            callback(false);
        };
        const success = (signer) => {
            console.debug('authenticated', signer);
            window.localStorage.setItem('key', signer.accessToken);
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

    get(url) {
        return request({
            method: 'GET',
            url: this._baseurl + url,
            headers: {'Authorization': 'Bearer ' + this._signer.accessToken}
          }).use(plugins.parse('json'));
    }

    getAlbums() {
        return this.get('/me/drive/root:/Photos:?expand=thumbnails,children(expand=thumbnails(select=large))').then(
            (json) => {
                const folders = json.body.children;
                console.debug('folders=', folders);
                // TODO pending support pagination with @odata.nextLink parameter
                return folders.map((element) => {
                    const albumId = element.id;
                    const albumName = element.name;
                    let coverPhoto = null;
                    if (element.thumbnails && element.thumbnails.length > 0) {
                        coverPhoto = new Photo(`thumb-${albumId}`, null, element.thumbnails[0]['large'].url, null);
                    }
                    return new Album(albumId, albumName, coverPhoto);
                });
            },
            (err) => err);
    }

    getPhotos(albumId) {
        // E4876DE43FA0DA3!3645
        // /me/drive/items/${albumId}/children?expand=thumbnails,children(expand=thumbnails(select=large))
        return this.get(`/me/drive/items/${albumId}/children?expand=thumbnails`).then(
            (json) => {
                console.info('json=', json);
                window.json = json;
                const photos = json.body.value;
                // TODO pending support pagination with @odata.nextLink parameter
                // filtering photos
                return photos.filter((e) => e['photo']).map((element) => {
                    const photoId = element.id;
                    const photoName = element.description;
                    let photoImg = null;
                    if (element.thumbnails && element.thumbnails.length > 0) {
                        photoImg = element.thumbnails[0]['large'].url;
                    }
                    return new Photo(photoId, photoName, photoImg, null);
                });
            },
            (err) => err);
    }

}

// singleton reference to AppConfig
const appConfig = new AppConfig();

window.appConfig = appConfig;

export default appConfig;