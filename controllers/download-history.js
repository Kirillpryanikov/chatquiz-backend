const tools = require("../dbtools");
const logger = require("../utils/logger");
const process = require("process");

const size = function(s) {
    return ~-encodeURI(s).split(/%..|./).length
};

module.exports = (req, res) => {

    const mToken = process.env.GW_MASTER_TOKEN || undefined;

    !mToken && res.status(403);


    if (!req.get('x-master-token') || req.get('x-master-token') !== mToken) {
        res.status(403).json({code: 403, message: 'Unauthorized or missing token'});
        return;
    }

    const startTime = new Date().getTime();
    logger.info("Requesting history download for room", { room: req.params.room });

    tools.message.downloadHistory(req.params.room)
        .then(
            (history) => {

                res.json({
                    code: 200,
                    data: history
                });

                logger.info("Chat history delivered", { room: req.params.room, elapsedTime: new Date().getTime() - startTime + "ms", size: size(history) + "B" } );

            }
        )
        .catch((e) => {
            res.status(500);
            logger.error(e);
        });


};