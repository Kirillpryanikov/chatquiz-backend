const _rp       = require("request-promise");
const process   = require("process");
const logger    = require("../utils/logger");

const url     = process.env.GW_API_URL;
const app_key = process.env.GW_APP_KEY;


class ApiError extends Error {

    constructor(endpoint, message = '') {
        super();
        this.endpoint = endpoint;
        this.message = message;
    }

};

const rp = function (params) {

    let cleanParams = JSON.parse(JSON.stringify(params));
    cleanParams['headers']['x-auth-token'] = typeof cleanParams['headers']['x-auth-token'] !== 'undefined' ? 'obfuscated' : '';
    logger.info('Http request', cleanParams);

    return _rp(params);
};

let ApiClass = function () {

    let _self = this;
    let token;

    const optionGen = function (endpoint) {

        let options = {
            uri: url + endpoint,
            headers: {
                "User-Agent": "Request-Promise",
                "x-app-key": app_key
            },
            json: true
        };

        if(token)
            options['headers']["x-auth-token"] = token;

        return options;
    };

    _self.token = function (t) {
        token = t;
        return _self;
    };

    _self.checkToken = function () {
        return rp(optionGen("/check-token/")).catch(err => Promise.reject(new ApiError('check-token',  err.response.body.message)));
    };

    _self.getUser = function (userId) {
        return rp(optionGen(`/user/${userId}/`)).catch(err => Promise.reject(new ApiError('user', err.response.body.message)));
    };

    _self.getList = function (listId) {
        return rp(optionGen(`/list/${listId}/`)).catch(err => Promise.reject(new ApiError('list', err.response.body.message)));
    };

    _self.getLists = function (userId) {
        return rp(optionGen(`/user/${userId}/list/`)).catch(err => Promise.reject(new ApiError('list', err.response.body.message)));
    };

    _self.uploadImage = function (options) {
        let httpOptions = optionGen(`/wallet/${options.room}/user-image-upload/`);
        delete httpOptions.json;
        httpOptions.method = 'POST';
        httpOptions.formData = options.formData;
        return rp(httpOptions).catch(err => Promise.reject(new ApiError('upload-image', err.response.body.message)));
    };

    _self.errorParser = function (e) {
        try {
            const response = JSON.parse(e.response.body).message;

            if(typeof response === 'string')
                return response;

            let concatResponse = '';
            for (let key in response) {
                if (response.hasOwnProperty(key)) {
                    for (let ikey in response[key]) {
                        if (response[key].hasOwnProperty(ikey)) {
                            concatResponse += response[key][ikey] + ". ";
                        }
                    }

                }
            }

            return concatResponse;

        }
        catch (e) {
            return null;
        }
    }
};


module.exports = new ApiClass();