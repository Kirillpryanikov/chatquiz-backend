const tools             = require("../dbtools");
const Joi               = require('joi');
const logger            = require("../utils/logger");
const api               = require('../utils/api');
const fs                = require("fs");
const dateformat        = require("dateformat");
const pmx               = require('../utils/keymetrics');
const topicSchema       = require('../schema/topic');
const handshakeSchema   = require('../schema/handshake');

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


        socket.locals = {};

        api.setToken(payload.token);


        api.checkToken()
            .then(
                function success() {
                    return api.getUser(payload.userId);
                },
                function error(err) {
                    console.log(">>>123", err.response.body.code);
                }
            )
            .then(function (apiPayload) {

                socket.locals.user = {
                    id: apiPayload.data.id,
                    name: apiPayload.data.firstName + " " + apiPayload.data.lastName,
                    imageUrl: apiPayload.data.imageUrl
                };

                return api.getList(payload.room);
            })
            .then(function (apiPayload) {

                let data = {};

                socket.locals.ownerId = apiPayload.data.userId;

                data.ownerId = apiPayload.data.userId;
                data.user = socket.locals.user;

                socket.join(payload.room);
                logger.info("User joining room", { userId: payload.userId, room: payload.room });

                socket.locals.room = payload.room;

                tools.room.getTopic(payload.room)
                    .then(
                        function success(topic) {
                            if(topic) {
                                socket.emit("topic_update", topic);
                                logger.info('Sending topic', { room: payload.room, topic: topic });
                            }
                        }
                    );

                tools.message.getHistory(payload.room, payload.userId, 0)
                    .then(
                        function success(history) {
                            socket.emit("history", history);
                            logger.info("Sending history", { room: payload.room, history_length: history.length, page: 0 } );
                            socket.emit("handshake", data);
                        },
                        function error() {
                            logger.info("Error while getting room history", { room: payload.room } );
                            socket.emit("handshake", data);
                        }
                    );

            })
            .catch(function (err) {

                console.log(err.response.body);

                if(err.response && err.response.body) {

                }


                // logger.info("Dropping user for expired session", { userId: payload.userId, room: payload.room });
                // socket.emit("chat_error", {
                //     code: 99,
                //     message: "Sessione scaduta"
                // });
                //
                // socket.disconnect();
                //
                // if (err.response.body.code === 403 || err.response.body.code === 404) {
                //     logger.info("Dropping user from invalid channel", { userId: payload.userId, room: payload.room });
                //
                //     socket.emit("chat_error", {
                //         code: 98,
                //         message: "Canale non attivo o inesistente"
                //     });
                // }
                //
                // socket.disconnect();

            });



        socket.on("message", data => {

            let messageBlock = {};
            messageBlock.message = data;
            messageBlock.from = socket.locals.user;
            messageBlock.time = new Date();
            messageBlock.room = socket.locals.room;
            messageBlock.likes = [];

            //data.topic && tools.room.set_topic(room.room, data.topic).then(resp => msg.topic = resp);


            tools.message.setMessage(messageBlock)
                .then(function (resp) {

                    messageBlock.msg_id = resp;
                    messageBlock.time = dateformat(messageBlock.time, "HH:MM");

                    io.sockets.in(socket.locals.room).emit("message", messageBlock);

                    logger.info("New message", messageBlock);
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

            tools.message.setLike(
                {
                    message_id: msgId,
                    user_id: socket.locals.user.id
                })
                .then(
                    function success(resp) {
                        io.sockets.in(socket.locals.room).emit("like", resp);
                        logger.info("Like save", { message_id: msgId, room: socket.locals.room, user: socket.locals.user.id })
                    },
                    function error() {
                        logger.error("Error saving like", { message_id: msgId, room: socket.locals.room, user: socket.locals.user.id });
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


                    api.uploadImage({
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
                                    messageBlock.msg_id = resp;
                                    messageBlock.time = dateformat(messageBlock.time, "HH:MM");

                                    io.sockets.in(socket.locals.room).emit("image", messageBlock);

                                });

                            fs.unlink(fileLocation, () => {});

                            logger.info("New image uploaded", { userId: socket.locals.user.id, room: socket.locals.room, url: image.data.imageUrl });

                        }
                    )
                        .catch(e => {

                            fs.unlink(fileLocation, () => {});

                            var message = api.errorParser(e);

                            socket.emit("chat_error", {
                                code: 100,
                                message: "Tentativo di caricamento dell'immagine fallito: " + message || "Errore durante il caricamento dell'immagine, i nostri tecnici sono stati notificati"
                            });

                            logger.error("Error uploading image", { userId: socket.locals.user.id, room: socket.locals.room, message: message });
                        });


                });


        });

        socket.on("load_history", data => {

            tools.message.getHistory(payload.room, payload.userId, data.page)
                .then(
                    function success(history) {
                        socket.emit("history", history);
                        logger.info("Sending history", { room: payload.room, history_length: history.length, page: data.page } );
                    },
                    function error() {
                        logger.info("Error while getting room history", { room: payload.room } );

                    }
                );

        });

    });

};