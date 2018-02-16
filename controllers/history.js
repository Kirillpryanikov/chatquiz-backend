const rp      = require("request-promise");
const tools   = require("../dbtools");
const logger  = require("../utils/logger");
const process = require("process");

module.exports = (req, res) => {

    logger.info("Requesting history for room", { room: req.params.room });

    tools.message.getHistory(req.params.room, req.params["x-User-Id"], req.params.page)

        .then(
            function success(resp) {
                res.json(resp);
            },
            function error() {
                res.json([]);
            }
        );

};