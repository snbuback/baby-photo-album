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
            scopes: ['user.read', 'files.read', 'files.read.all', 'sites.read.all']
        });
    }

    _setup(signer) {
        this._signer = signer;
        // clear token in URL
        // window.location.hash = '';
        // this.client = Client.init({
        //     authProvider: (done) => {
        //         done(null, signer.accessToken); //first parameter takes an error if you can't get an access token
        //     }
        // });
    }

    getAuthStatus(callback) {
        if (this._signer !== null) {
            console.debug('already authenticated');
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
            this._setup(signer);
            callback(true);
        };

        const url = window.location.toString();
        this._oauth2.token.getToken(url).then(
            (signer) => {
                if (signer && signer.accessToken) {
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
        // return this.client.api(url).get();
        return request(this._signer.sign({
            method: 'GET',
            url: this._baseurl + url,
            headers: {'Authorization': 'Bearer ' + this._signer.accessToken}
          })).use(plugins.parse('json'));
    }

    getAlbums() {
        return this.get('/me/drive/root:/Photos:?expand=thumbnails,children(expand=thumbnails(select=large))').then(
            (json) => {
                const folders = json.body.children;
                // pending support pagination with @odata.nextLink parameter
                return folders.map((element) => {
                    // if (item.thumbnails && item.thumbnails.length > 0) {
                    //     var container = $("<div>").attr("class", "img-container").appendTo(tile)
                    //     $("<img>").
                    //       attr("src", item.thumbnails[0][thumbnailSize].url).
                    //       appendTo(container);
                    //   }
                    const albumName = element.name;
                    const albumId = element.id;
                    let coverPhoto = null;
                    if (element.thumbnails && element.thumbnails.length > 0) {
                        coverPhoto = new Photo(`thumb-${albumId}`, null, element.thumbnails[0]['large'].url, null);
                    }
                    return new Album(albumId, albumName, coverPhoto);
                });
            },
            (err) => err);
    }

}

// singleton reference to AppConfig
const appConfig = new AppConfig();

window.appConfig = appConfig;

export default appConfig;