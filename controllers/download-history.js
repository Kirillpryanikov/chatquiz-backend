const rp      = require("request-promise");
const tools   = require("../dbtools");
const logger  = require("../utils/logger");
const process = require("process");

module.exports = (req, res) => {

    const mToken = process.env.GW_MASTER_TOKEN || undefined;
    !mToken && res.status(400);

    const options = {
        uri: process.env.GW_API_URL + "/check-token/",
        headers: {
            "User-Agent": "Request-Promise",
            "x-app-key": process.env.GW_APP_KEY,
            "x-auth-token": mToken
        },
        json: true
    };

    rp(options)
        .then(function() {

            logger.info("Requesting history download for room", { room: req.params.room });

            //TODO: CONVERT TO PROMISE
            tools.message.downloadHistory(req.params.room, function(err, history) {
                if (err) {
                    logger.error("Download history: "+ err +" room: "+ req.params.room);
                } else {
                    res.json(history);
                }
            });

        })
        .catch(function(err) {
            logger.error(err.response.body.message);
        });
};