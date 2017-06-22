const express = require('express');
const passport = require('passport');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const _ = require('lodash');
const config = require('./config/config');
const logger = require('./config/logger');
const socketMiddleware = require('./config/socketMiddleware');
// const socketIO = require('socket.io');

mongoose.Promise = global.Promise;
mongoose.connect(config.database);
mongoose.connection.on('connected', () => {
    console.log('connected to database: ' + config.database);
});

mongoose.connection.on('error', (err) => {
    console.log('Error: ' + err);
});

const app = express();
const port = process.env.PORT || 8080;

const server = http.createServer(app);
// const io = socketIO(server);
app.use(socketMiddleware(server));

app.use(express.static(__dirname + '/dist'));

logger.debug("Overriding 'Express' logger");
app.use(require('morgan')('combined', {
    "stream": logger.stream
}));

//router middleware
const users = require('./routes/users');


//bodyparser middleware
app.use(bodyParser.json());

//CORS middleware (cross origin requests)
app.use(cors());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(users);

require('./config/passport')(passport);


// io.on('connection', function (socket) {
//     socket.on('connectToGroup', function (group) {
//         let groupNsp = io.of('/' + listid + '/chat');
//
//         groupNsp.on('connection', socket => {
//
//         });
//     });
// });
//
// let RoomsArray = ['ttt', 'ddd', 'ggg'];
// let sokectsArray = [];
//
// RoomsArray.forEach((room) => {
//     let rm = io.of(room);
//
//     rm.on('connection', (socket) => {
//         console.log(`connect to room ${room}`);
//         socket.on('message', (data) => {
//             console.log('message');
//             rm.emit('out-message', data);
//         });
//         socket.on('delete', room => {
//             console.dir(rm, {
//                 color: 'green'
//             });
//         });
//     });
//     sokectsArray.push(rm);
// });

server.listen(port, () => {
    console.log(`Socket server started listen on port: ${port}`);
});
