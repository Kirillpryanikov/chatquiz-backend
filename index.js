const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const config = require('./config/config');
const logger = require('./config/logger');
const request = require('request');
const cors = require('cors');
const rp = require('request-promise');

const socketIO = require('socket.io');

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());

app.use(express.static(__dirname + '/dist'));

logger.debug("Overriding 'Express' logger");
app.use(require('morgan')('combined', {
    "stream": logger.stream
}));

app.use('/', (req, res) => {
    var url = 'https://apidev.growish.com/v1' + req.url;
    req.pipe(request(url)).pipe(res);
});

io.sockets.on('connection', function (socket) {

    var userid = socket.handshake.query.userid;

    socket.on('room', function (room) {
        let currentRoom = room;
        socket.join(room);
        socket.on('message', data => {
            let msg = {
                message: data.message,
                from: data.user,
                time: new Date()
            };
            io.sockets.in(room).emit('message', msg);
        });

        socket.on('image', data => {
            let token = data.token;
            let options = {
                uri: 'https://apidev.growish.com/v1/check-token/',
                headers: {
                    'User-Agent': 'Request-Promise',
                    'x-app-key': '1234567890',
                    'x-auth-token': token,
                },
                form: {
                    file: data.image
                }
            };

            rp(options).then(image => {
                let msg = {
                    message: data.message,
                    image: image.imageUrl,
                    from: data.user,
                    time: new Date()
                };
                io.sockets.in(room).emit('image', msg);
            }).catch(e => {
                let msg = {
                    message: data.message,
                    image: data.image,
                    imageName: data.image_name,
                    from: data.user,
                    time: new Date()
                };
            });
        });


        socket.on('disconnect', function (room) {
            socket.leave(room);
        });
    });

});


server.listen(port, () => {
    console.log(`Socket server started listen on port: ${port}`);
});
