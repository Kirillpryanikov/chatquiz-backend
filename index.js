const express = require("express");
const path = require("path");
const http = require("http");
const logger = require("morgan");
const request = require("request");
const cors = require("cors");
const rp = require("request-promise");
const fs = require("fs");
const socketIO = require("socket.io");
const process = require("process");
const rfs = require("rotating-file-stream");
const winston = require("winston");
const app = express();
const dateformat = require("dateformat");
const tools = require("./dbtools-compiled");


require("dotenv").config({
    path: path.resolve(".env")
});

const port = process.env.PORT || 8080;
const url = process.env.APIURL;
const app_key = process.env.APPKEY;
const color = process.env.COLOR;
const text_color = process.env.TEXT_COLOR;
const server = http.createServer(app);
const io = socketIO(server);
process.title = "chatMicroS";

const logDirectory = path.join(__dirname, "log");

const accessLogStream = rfs("access.log", {
    interval: "1d",
    path: logDirectory
});

const errorLogStream = rfs("error.log", {
    interval: "1d",
    path: logDirectory
});

const log_socket = new winston.Logger({
    level: "info",
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({filename: "log/socket.log" })
    ]
});

const log_errors = new winston.Logger({
    level: "error",
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({filename: "log/errors.log" })
    ]
});

app.use(logger("combined", {stream: accessLogStream}));
app.use(logger("dev"));

app.use(cors());

app.use(express.static(__dirname + "/dist"));


app.use("/apiproxy", (req, res) => {
    const apiurl = url + req.url;
    req.pipe(request(apiurl)).pipe(res);
});

app.get("/history/:room/:page", (req, res) => {
    const options = {
        uri: url+ "/check-token/",
        headers: {
            "User-Agent": "Request-Promise",
            "x-app-key": app_key,
            "x-auth-token": req.headers["x-auth-token"]
        },
        json: true
    };

    rp(options)
        .then(function () {
            tools.message.get_history(req.params.room, req.params["x-User-Id"], req.params.page, function (err, resp) {
                if(resp) {
                    res.json(resp);
                }
            });
        })
        .catch(function (err) {
            log_errors.error("SOCKET room:"+ room.room +" user(id|name|message): "+ data.user.id + " | "
                + data.user.firstName + " | ", err.response.body.message);
            msg.errors = err.response.body.message;
            socket.emit("message", msg);
        });
});

app.get("/download_history/:room", function(req, res) {

    const mToken = process.env.MASTER_TOKEN || undefined;
    !mToken && res.status(400);

    const options = {
        uri: url + "/check-token/",
        headers: {
            "User-Agent": "Request-Promise",
            "x-app-key": app_key,
            "x-auth-token": mToken
        },
        json: true
    };

    rp(options)
        .then(function() {
            tools.message.download_history(req.params.room, function(err, history) {
                if (err) {
                    log_errors.info("Download history: "+ err +" room: "+ req.params.room);
                } else {
                    res.json(history);
                }
            });
        })
        .catch(function(err) {
            log_errors.error("Download history: " + err + " room: "+ req.params.room);
        });
});

app.use(function(req, res) {
    log_errors.error("HTTP error  url:" + req.url);
    res.status(404).send("Sorry cant find that!");
});

io.sockets.on("connection", function (socket) {
    let msg = {};

    socket.on("room", function (room) {
        const options = {
            uri: `${url}/list/${room.room}/`,
            headers: {
                "User-Agent": "Request-Promise",
                "x-app-key": app_key,
                "x-auth-token": room.token
            },
            json: true
        };

        tools.room.get_topic(room.room, function (err, resp) {
            if(resp) {
                socket.emit("room", {"topic": resp, "topic_length": process.env.TOPIC_LENGTH});
            }
        });

        tools.message.get_history(room.room, room.userId, 0, function (err, resp) {
            if(resp) {
                socket.emit("room", {"history": resp});
            }
        });

        let data = {
            "color":color, 
            "text_color": text_color,
            "topic_length": process.env.TOPIC_LENGTH
        };

        rp(options)
            .then(function (resp) {
                data.owner_id = resp.data.userId;
                data.statusCode = resp.code;
                socket.emit("room", data);
            })
            .catch(function (err) {
                if (err.response.body.code === 400 || err.response.body.code === 404) {
                    log_errors.error("SOCKET room:"+ room.room + ", error: " + err.response.body.message);

                    data.statusCode = err.response.body.code;
                    socket.emit("room", data);
                }
            });

        socket.join(room.room);
        log_socket.info("user(id|name): "+room.userId + " "+ room.username +" join to room:"+ room.room);

        socket.on("message", data => {
            const options = {
                uri: url+ "/check-token/",
                headers: {
                    "User-Agent": "Request-Promise",
                    "x-app-key": app_key,
                    "x-auth-token": data.from.token
                },
                json: true
            };

            rp(options)
                .then(function () {})
                .catch(function (err) {
                    log_errors.error("SOCKET room:"+ room.room +" user(id|name|message): "+ data.from.id + " | " +
                        data.from.firstName + " | ", err.response.body.message);
                    msg.errors = err.response.body.message;
                    socket.emit("message", msg);
                });

            msg.message = data.message;

            data.topic && tools.room.set_topic(room.room, data.topic).then(resp => msg.topic = resp);


            msg.from = data.from;
            msg.time = new Date();
            msg.room = room.room;
            msg.likes = [];

            tools.message.set_message(msg)
                .then(function (resp) {
                    msg.msg_id = resp;
                    msg.time = dateformat(msg.time, "HH:MM");
                    io.sockets.in(room.room).emit("message", msg);
                    log_socket.info("room:"+ room.room +" user(id|name|message): "+ data.from.id + " | "+
                        data.from.firstName + " | " + data.message);
                });
        });

        socket.on("writing", data => {
            io.sockets.in(room.room).emit("writing", data);
        });

        socket.on("like", data => {
            tools.message.set_like(data, function (err, resp) {
                if (err) {
                    log_errors.error("SET LIKE room:"+ room.room +" user_id: "+ data.user_id +
                        " | message_id: " + data.message_id + " | error: ", err);
                }
                log_socket.info("SET LIKE room:"+ room.room +" user_id: "+ data.user_id +
                    " | message_id: " + data.message_id);
                io.sockets.in(room.room).emit("like", resp);                
            });
        });

        socket.on("logout", room => socket.leave(room.room));

        socket.on("image", data => {
            let file = new Buffer(data.image, "base64");

            fs.writeFileSync(data.image_name.toString(), data.image.split(",")[1], "base64");

            let options = {
                method: "POST",
                uri: `${url}/list/${room.room}/chat-image-upload/`,
                headers: {
                    "User-Agent": "Request-Promise",
                    "x-app-key": app_key,
                    "x-auth-token":  data.token
                },
                formData: {
                    file: {
                        value: fs.createReadStream(data.image_name.toString()),
                        options: {
                            filename: data.image_name.toString()
                        }
                    }
                }
            };

            rp(options)
                .then(response => {

                    let image = JSON.parse(response);
                    let msg = {
                        message: data.message,
                        image: image.data.imageUrl,
                        from: data.from,
                        time: new Date(),
                        room: room.room,
                        likes: []
                    };
                
                    tools.message.set_message(msg)
                        .then(function (resp) {
                            msg.msg_id = resp;
                            msg.time = dateformat(msg.time, "HH:MM");
                            io.sockets.in(room.room).emit("image", msg);
                        });

                    fs.unlinkSync(data.image_name.toString());
                    log_socket.info("Image upload:: room:"+ room.room +" user(id|name|imageUrl): "
                        + data.from.id + " | " + data.from.firstName + " | " + image.data.imageUrl);

                })
                .catch(e => {
                    let msg = {
                        from: data.from,
                        errors: JSON.parse(e.response.body),
                        time: new Date()
                    };
                    io.sockets.in(room.room).emit("image", msg);
                    fs.unlinkSync(data.image_name.toString());
                    log_errors.error("SOCKET room: " + room.room + " errors: ", msg.errors);
                });
        });

        socket.on("disconnect", room => socket.leave(room.room));
    });

});

server.listen(port, () => {
    console.log(`Socket server started listen on port: ${port}`);
});