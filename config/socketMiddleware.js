const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const {User} = require('../models/User');

module.exports = (server) => {
    const io = socketIO(server);
    //connect to sockets
    io.sockets.on('connection', function (socket) {
      //this is used to verify token and if token is valid and user is found it connects him to room
      // also this code used as middleware
      jwt.verify(socket.handshake.query.token, config.secret, (err, deccoded) => {
        if (err) {
          //if token is not valid rejects creating a room
          return;
        } else {
          //finds user in database
          User.findById(deccoded.id).then(user => {
            if(!user) {
              return;
            } else {
              let currentuser = {
                username : user.firstname,
                id: user._id,
                avatar: user.imageUrl
              };
              socket.on('room', function (room) {
                  socket.join(room);
                  socket.on('message', data => {
                      let msg = {
                          message: data.message,
                          from: currentuser,
                          time: new Date()
                      };
                      console.log(msg);
                    io.sockets.in(room).emit('message', msg);
                  });

                  socket.on('image', data => {
                    let msg = {
                      message: data.message,
                      image: data.image,
                      imageName: data.image_name,
                      from: currentuser,
                      time: new Date()
                    };
                    io.sockets.in(room).emit('image', msg);
                  });
              });
              socket.on('disconnect', function (room) {
                  socket.leave(room);
              });
            }
          });
        }
      });
    });
    //middleware mock does nothing, but needed
 return function(req, res, next) {
   next();
 };
};
