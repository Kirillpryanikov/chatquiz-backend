const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const config = require('./config/config');
const logger = require('morgan');
const request = require('request');
const cors = require('cors');
const rp = require('request-promise');
const fs = require('fs');
const socketIO = require('socket.io');
const stream = require('stream');
const process = require('process');
const rfs = require('rotating-file-stream');
var winston = require('winston');
const app = express();
const port = process.env.PORT || 8080;
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
        new (winston.transports.File)({filename: 'winston_logs/errors.log' })
    ]
});

app.use(logger('combined', {stream: accessLogStream}));
app.use(logger('dev'));

app.use(cors());

app.use(express.static(__dirname + '/dist'));


app.use('/', (req, res) => {
    const url = 'https://apidev.growish.com/v1' + req.url;
    req.pipe(request(url,function(error,response, body){
        if(res.statusCode === 404 && req.url !== '/favicon.ico') {
            log_errors.error('HTTP code:'+res.statusCode+' url:'+req.url);
        }
    })).pipe(res);

});


io.sockets.on('connection', function (socket) {

    socket.on('room', function (room) {

        socket.join(room.room);
        log_socket.info('user(id|name): '+room.userId + ' '+ room.username +' join to room:'+ room.room);

        socket.on('message', data => {
            var token = data.user.token;
            var options = {
                uri: 'https://apidev.growish.com/v1/check-token/',
                headers: {
                    'User-Agent': 'Request-Promise',
                    'x-app-key': '1234567890',
                    'x-auth-token': token
                },
                json: true
            };

            let msg = {
                message: data.message,
                from: data.user,
                time: new Date()
            };

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
            let token = data.token;

            let options = {
                method: 'POST',
                uri: `https://apidev.growish.com/v1/list/${room.room}/chat-image-upload/`,
                headers: {
                    'User-Agent': 'Request-Promise',
                    'x-app-key': '1234567890',
                    'x-auth-token': token
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