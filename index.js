const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const config = require('./config/config');
const logger = require('./config/logger');
const request = require('request');
const cors = require('cors');
const rp = require('request-promise');
const fs = require('fs');
const socketIO = require('socket.io');
const stream = require('stream');

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
            let file = new Buffer(data.image, 'base64');
            fs.writeFileSync(data.image_name.toString(), data.image.split(',')[1],'base64');
            let token = data.token;

            let options = {
              method: 'POST',
                uri: `https://apidev.growish.com/v1/list/${room}/chat-image-upload/`,
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
                console.log(image);

                io.sockets.in(room).emit('image', msg);
                fs.unlinkSync(data.image_name.toString());
            }).catch(e => {

                let msg = {
                    message: data.message,
                    image: data.image,
                    imageName: data.image_name,
                    from: data.user,
                    time: new Date()
                };
                console.log(e);
                fs.unlinkSync(data.image_name.toString());
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
