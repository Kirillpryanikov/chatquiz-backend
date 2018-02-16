const rp      = require("request-promise");
const process = require("process");

const url     = process.env.GW_API_URL;
const app_key = process.env.GW_APP_KEY;

let token;

const optionGen = function (endpoint) {
    return {
        uri: url + endpoint,
        headers: {
            "User-Agent": "Request-Promise",
            "x-app-key": app_key,
            "x-auth-token": token
        },
        json: true
    }
};

module.exports = {
    setToken: function (_token) {
        token = _token;
    },
    checkToken: function () {
        return rp(optionGen("/check-token/"));
    },
    getUser: function (userId) {
        return rp(optionGen(`/user/${userId}/`));
    },
    getList: function (listId) {
        return rp(optionGen(`/list/${listId}/`));
    },
    uploadImage: function (options) {
        var httpOptions = optionGen(`/list/${options.room}/chat-image-upload/`);
        delete httpOptions.json;
        httpOptions.method = 'POST';
        httpOptions.formData = options.formData;
        return rp(httpOptions);
    },
    errorParser: function (e) {
        try {
            return JSON.parse(e.response.body).message;
        }
        catch (e) {
            return null;
        }
    }
};