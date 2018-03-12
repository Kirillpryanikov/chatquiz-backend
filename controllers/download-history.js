const tools     = require("../dbtools");
const logger    = require("../utils/logger");
const process   = require("process");
const api       = require('../utils/api');

const size = function(s) {
    return ~-encodeURI(s).split(/%..|./).length
};


const processRequest = function(room, res) {

    const startTime = new Date().getTime();
    logger.info("Requesting history download for room", { room: room });

    tools.message.downloadHistory(room)
        .then(
            (history) => {

                res.json({
                    code: 200,
                    data: history
                });

                logger.info("Chat history delivered", { room: room, elapsedTime: new Date().getTime() - startTime + "ms", size: size(history) + "B" } );

            }
        )
        .catch((e) => {
            res.status(500);
            logger.error(e);
        });

};

module.exports = (req, res) => {

    const mToken = process.env.GW_MASTER_TOKEN || undefined;

    if(!req.params.room) {
        res.status(403).json({code: 400, message: 'Room field missing'});
    }

    else if (mToken && req.get('x-master-token') && req.get('x-master-token') !== mToken) {
        res.status(403).json({code: 403, message: 'Unauthorized master access'});
    }

    else if (mToken && req.get('x-master-token') && req.get('x-master-token') === mToken) {
        processRequest(req.params.room, res);
    }

    else if(req.get('x-auth-token')) {

        api.token(req.get('x-auth-token')).checkToken()
            .then(
                function success(response) {
                    return api.token(req.get('x-auth-token')).getLists(response.data.id);
                }
            )
            .then(
                function success (response) {

                    for(let x = 0; x < response.data.length; x++) {
                        if(response.data[x].id === req.params.room) {
                            processRequest(req.params.room, res);
                            return;
                        }
                    }

                    res.status(403).json({code: 403, message: 'Unauthorized'});
                }
            )
            .catch(function (err) {
                logger.error("Error trying to download history", { error: err });
                res.status(500).json({ code: 500, error: err });
            });
    }

    else {
        res.status(403).json({code: 403, message: 'Unauthorized'});
    }



};