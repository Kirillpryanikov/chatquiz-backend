const request = require('request');
const socketIO = require('socket.io');

module.exports = (server) => {
    const io = socketIO(server);
    io.sockets.on('connection', function (socket) {

              socket.on('room', function (room) {
                  socket.join(room);
                  socket.on('message', data => {
                      let msg = {
                          message: data.message,
                          from: currentuser,
                          time: new Date()
                      };
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
            });

    //middleware mock does nothing, but needed
 return function(req, res, next) {
   next();
 };
};
