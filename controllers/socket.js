const tools             = require("../dbtools");
const Joi               = require('joi');
const logger            = require("../utils/logger");
const api               = require('../utils/api');
const fs                = require("fs");
const dateformat        = require("dateformat");
const pmx               = require('../utils/keymetrics');
const topicSchema       = require('../schema/topic');
const handshakeSchema   = require('../schema/handshake');
const sanitizeHtml      = require('sanitize-html');

const tmpDirectory = './tmp';

const probe             = pmx.probe();
const connectionsProbe  = probe.metric({
    name    : 'Chat connections'
});

connectionsProbe.set(0);

let io;

const refreshConnectionsProbe = () => {
    io.of('/').clients((error, clients) => {
        if (!error) {
            connectionsProbe.set(clients.length);
        }
    });
};

module.exports.setIO = function (_io) {
    io = _io;
};

module.exports.controller = (socket) => {

    const handshakeTimer = setTimeout(() => {
        socket.disconnect();
        logger.info('Socket disconnected, handshake timeout', {
            socketId: socket.id,
            remoteAddress: socket.handshake.address
        });
    }, 10000);

    logger.info("New socket connection", {
        socketId: socket.id,
        remoteAddress: socket.handshake.address
    });

    refreshConnectionsProbe();


    socket.on("disconnect", () => {

        if(socket.locals && socket.locals.room)
            socket.leave(socket.locals.room);

        if(handshakeTimer)
            clearTimeout(handshakeTimer);

        logger.info("Socket disconnected", {
            socketId: socket.id,
            remoteAddress: socket.handshake.address
        });

        refreshConnectionsProbe();

    });

    socket.on("handshake", function (payload) {

        clearTimeout(handshakeTimer);

        const validation = Joi.validate(payload, handshakeSchema);
        if(validation.error) {
            logger.error("Error while handshaking", {
                validation_err: validation.message
            });
            return false;
        }


        socket.locals = {
            token: payload.token
        };


        api.token(socket.locals.token).checkToken()
            .then(
                function success() {
                    return api.token(socket.locals.token).getUser(payload.userId);
                }
            )
            .then(
                function success(apiPayload) {

                    socket.locals.user = {
                        id: apiPayload.data.id,
                        name: apiPayload.data.firstName + " " + apiPayload.data.lastName,
                        imageUrl: apiPayload.data.imageUrl
                    };

                    return api.token(socket.locals.token).getList(payload.room);

                }
            )
            .then(
                function success (apiPayload) {

                    let data = {};

                    socket.locals.ownerId = apiPayload.data.userId;

                    data.ownerId = apiPayload.data.userId;
                    data.user = socket.locals.user;

                    socket.locals.room = apiPayload.data.id;

                    socket.join(apiPayload.data.id);
                    logger.info("User joining room", { userId: payload.userId, room: socket.locals.room });



                    tools.room.getTopic(socket.locals.room)
                        .then(
                            function success(topic) {
                                if(topic) {
                                    socket.emit("topic_update", topic);
                                    logger.info('Sending topic', { room: socket.locals.room, topic: topic });
                                }
                            }
                        );

                    tools.message.getHistory(socket.locals.room, payload.userId, 0)
                        .then(
                            function success(history) {
                                socket.emit("history", history);
                                logger.info("Sending history", { room: socket.locals.room, history_length: history.length, page: 0 } );
                                socket.emit("handshake", data);
                            },
                            function error(e) {
                                console.log(e);
                                logger.error("Error while getting room history", { room: socket.locals.room, error: e } );
                                socket.emit("handshake", data);
                            }
                        );

            }
            )
            .catch(function (err) {


                if(err.constructor.name === 'ApiError') {

                    switch(err.endpoint) {

                        case 'check-token':

                            logger.info("Dropping user for expired session", { userId: payload.userId, room: socket.locals.room || payload.room, errorMessage: err.message });
                            socket.emit("chat_error", {
                                code: 99,
                                message: "Sessione scaduta"
                            });

                            break;

                        case 'user':

                            logger.info("User is not found in API", { userId: payload.userId, room: socket.locals.room || payload.room, errorMessage: err.message });
                            socket.emit("chat_error", {
                                code: 99,
                                message: "Sessione scaduta"
                            });

                            break;

                        case 'list':

                            logger.info("Dropping user for invalid channel", { userId: payload.userId, room: socket.locals.room || payload.room, errorMessage: err.message });

                            socket.emit("chat_error", {
                                code: 98,
                                message: "Canale non attivo o inesistente"
                            });

                            break;

                    }

                }

                //APPLICATION ERROR
                else {

                    logger.error(err);

                    socket.emit("chat_error", {
                        code: 1,
                        message: ""
                    });

                }

                socket.disconnect();

            });



        socket.on("message", data => {

            let messageBlock = {};
            messageBlock.message = sanitizeHtml(data, { allowedTags: [], allowedAttributes: [] });

            messageBlock.from = socket.locals.user;
            messageBlock.time = new Date();
            messageBlock.room = socket.locals.room;
            messageBlock.likes = [];


            tools.message.setMessage(messageBlock)
                .then(function (resp) {

                    messageBlock.id = resp._id;

                    io.sockets.in(socket.locals.room).emit("message", messageBlock);

                    logger.info("New message", { id: resp._id.toString(), room: socket.locals.room, userId: socket.locals.user.id});
                });
        });

        socket.on("topic_update", (topic) => {

            if(socket.locals.user.id !== socket.locals.ownerId) {
                logger.info("User not authorized to change topic", { room: socket.locals.room, userId: socket.locals.user.id } );
                return false;
            }

            Joi.validate(topic, topicSchema, (err) => {

                if(err) {
                    logger.error("Error changing topic", { room: socket.locals.room, topic: topic, validation_err: err.message } );
                    return;
                }

                tools.room.setTopic(socket.locals.room, topic);

                logger.info("Changing topic", { room: socket.locals.room, topic: topic } );
                io.sockets.in(socket.locals.room).emit("topic_update", topic);

            });




        });

        socket.on("writing", data => {
            io.sockets.in(socket.locals.room).emit("writing", { id: socket.locals.user.id , name: socket.locals.user.name });
        });

        socket.on("like", msgId => {

            logger.info("New Like request", { messageId: msgId, room: socket.locals.room, user: socket.locals.user.id });

            tools.message.setLike(
                {
                    id: msgId,
                    user_id: socket.locals.user.id
                })
                .then(
                    function success(resp) {
                        io.sockets.in(socket.locals.room).emit("like", resp);
                    },
                    function error() {
                        logger.error("Error saving like", { messageId: msgId, room: socket.locals.room, user: socket.locals.user.id });
                    }
                );

        });

        socket.on("logout", room => socket.leave(socket.locals.room));

        socket.on("image", data => {

            if (!fs.existsSync(tmpDirectory))
                fs.mkdirSync(tmpDirectory);

            const fileLocation = tmpDirectory + "/" + new Date().getTime() + "-" + new Buffer(data.image_name.toString()).toString('base64');

            fs.writeFile(fileLocation, data.image.split(",")[1], { encoding: "base64" },
                (err) => {

                    if(err) {
                        socket.emit("chat_error", {
                            code: 100,
                            message: "Errore durante il caricamento dell'immagine, i nostri tecnici sono stati notificati"
                        });
                        logger.error("Error saving to file system", err);
                        return false;
                    }


                    api.token(socket.locals.token).uploadImage({
                        room: socket.locals.room,
                        formData: {
                            file: {
                                value: fs.createReadStream(fileLocation),
                                options: {
                                    filename: data.image_name.toString()
                                }
                            }
                        }
                    }).then(
                        response => {

                            let image = JSON.parse(response);

                            let messageBlock = {};
                            messageBlock.message = data.message;
                            messageBlock.image = image.data.imageUrl;
                            messageBlock.from = socket.locals.user;
                            messageBlock.time = new Date();
                            messageBlock.room = socket.locals.room;
                            messageBlock.likes = [];

                            tools.message.setMessage(messageBlock)
                                .then(function (resp) {
                                    messageBlock.id = resp._id;

                                    io.sockets.in(socket.locals.room).emit("image", messageBlock);
                                    logger.info("New image uploaded", { id: resp.id.toString(), room: socket.locals.room, userId: socket.locals.user.id, url: image.data.imageUrl});

                                });

                            fs.unlink(fileLocation, () => {});

                        }
                    )
                        .catch(e => {

                            fs.unlink(fileLocation, () => {});

                            var message = api.errorParser(e);

                            socket.emit("chat_error", {
                                code: 100,
                                message: "Tentativo di caricamento dell'immagine fallito: " + message || "Errore durante il caricamento dell'immagine, i nostri tecnici sono stati notificati"
                            });

                            console.log(e);

                            logger.error("Error uploading image", { userId: socket.locals.user.id, room: socket.locals.room, error: e });
                        });


                });


        });

        socket.on("load_history", data => {

            tools.message.getHistory(socket.locals.room, payload.userId, data.page)
                .then(
                    function success(history) {
                        socket.emit("history", history);
                        logger.info("Sending history", { room: socket.locals.room, history_length: history.length, page: data.page } );
                    },
                    function error(e) {
                        logger.info("Error while getting room history", { room: socket.locals.room, error: e } );

                    }
                );

        });

    });

};