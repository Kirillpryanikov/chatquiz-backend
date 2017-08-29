const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const logger = require('morgan');
const request = require('request');
const cors = require('cors');
const rp = require('request-promise');
const fs = require('fs');
const socketIO = require('socket.io');
const stream = require('stream');
const process = require('process');
const rfs = require('rotating-file-stream');
const winston = require('winston');
const app = express();
require('dotenv').config({
    path: path.resolve('.env')
});

const port = process.env.PORT || 8080;
const url = process.env.APIURL;
const app_key = process.env.APPKEY;
const color = process.env.COLOR;
const server = http.createServer(app);
const io = socketIO(server);
process.title = "chatMicroS";

const logDirectory = path.join(__dirname, 'log');

const accessLogStream = rfs('access.log', {
    interval: '1d',
    path: logDirectory
});

const errorLogStream = rfs('error.log', {
    interval: '1d',
    path: logDirectory
});

const log_socket = new winston.Logger({
    level: 'info',
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({filename: 'log/socket.log' })
    ]
});

const log_errors = new winston.Logger({
    level: 'error',
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({filename: 'log/errors.log' })
    ]
});

app.use(logger('combined', {stream: accessLogStream}));
app.use(logger('dev'));

app.use(cors());

app.use(express.static(__dirname + '/dist'));


app.use('/apiproxy', (req, res) => {
    const apiurl = url + req.url;
    req.pipe(request(apiurl)).pipe(res);
});
app.use(function(req, res, next) {
    log_errors.error('HTTP error  url:'+req.url);
    res.status(404).send('Sorry cant find that!');
});

io.sockets.on('connection', function (socket) {
    let msg ={};
    socket.on('room', function (room) {
        var options = {
            uri: `${url}/list/${room.room}/`,
            headers: {
                'User-Agent': 'Request-Promise',
                'x-app-key': app_key,
                'x-auth-token': room.token
            },
            json: true
        };
        rp(options)
            .then(function (resp) {
                socket.emit('room', {'owner_id':resp.data.userId,'color':color});
            })
            .catch(function (err) {
                console.log('resp err');
            });
        socket.join(room.room);
        log_socket.info('user(id|name): '+room.userId + ' '+ room.username +' join to room:'+ room.room);

        socket.on('message', data => {
            var options = {
                uri: url+ '/check-token/',
                headers: {
                    'User-Agent': 'Request-Promise',
                    'x-app-key': app_key,
                    'x-auth-token': data.user.token
                },
                json: true
            };
            msg.message = data.message;
            msg.from = data.user;
            msg.time = new Date();

            log_socket.info('room:'+ room.room +' user(id|name|message): '+ data.user.id + ' | '+ data.user.firstName + ' | ' + data.message);

            io.sockets.in(room.room).emit('message', msg);

            rp(options)
                .then(function () {})
                .catch(function (err) {
                    log_errors.error('SOCKET room:'+ room.room +' user(id|name|message): '+ data.user.id + ' | '+ data.user.firstName + ' | ', err.response.body.message);
                    msg.errors = err.response.body.message;
                    socket.emit('message', msg);
                });

        });

        socket.on('writing', data => {
            io.sockets.in(room.room).emit('writing', data);
        });

        socket.on('image', data => {
            let file = new Buffer(data.image, 'base64');
            fs.writeFileSync(data.image_name.toString(), data.image.split(',')[1], 'base64');

            let options = {
                method: 'POST',
                uri: `${url}/list/${room.room}/chat-image-upload/`,
                headers: {
                    'User-Agent': 'Request-Promise',
                    'x-app-key': app_key,
                    'x-auth-token':  data.token
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

            rp(options).then(response => {

        let image = JSON.parse(response);
                let msg = {
                    message: data.message,
                    image: image.data.imageUrl,
                    from: data.user,
                    time: new Date()
                };

                io.sockets.in(room.room).emit('image', msg);
                fs.unlinkSync(data.image_name.toString());
                log_socket.info('Image upload:: room:'+ room.room +' user(id|name|imageUrl): '+data.user.id +' | '+ data.user.firstName +' | '+image.data.imageUrl);

    }).catch(e => {
                let msg = {
                    from: data.user,
                    errors: JSON.parse(e.response.body),
                    time: new Date()
                };
                io.sockets.in(room.room).emit('image', msg);
                fs.unlinkSync(data.image_name.toString());
                log_errors.error('SOCKET room:'+ room.room +' errors: ',msg.errors);

    });
        });

        socket.on('disconnect', function (room) {
            socket.leave(room.room);
        });
    });

});


server.listen(port, () => {
    console.log(`Socket server started listen on port: ${port}`);
});