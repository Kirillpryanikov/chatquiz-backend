const proxy     = require('express-http-proxy');
const process   = require('process');

module.exports = proxy(process.env.GW_API_URL,
    {
        https: true,
        proxyReqPathResolver: function (req) {
            return require('url').parse(req.url).path;
        }
    }
);