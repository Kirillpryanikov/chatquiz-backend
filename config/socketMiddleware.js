const socketIO = require('socket.io');

module.exports = (server) => {
    const io = socketIO(server);
    return function (req, res, next) {

        req.io = io;

        io.sockets.on('connection', function (socket) {

            let connectedRoom = req.params.listid;

            socket.on('room', function (room) {
                socket.join(room);
            });

            socket.on('message', data => {
                let msg = {
                    message: data.message,
                    from: req.user.email,
                    time: new Date()
                };
                io.socekts.in(connectedRoom).emit('message', msg);
            });
        });

        // req.io = io;
        // io.of('/bomj').on('connection', (socket, data) => {
        //   console.log(socket);
        // });
        //
        // req.createRoom = (roomName, nm) => {
        //   const room = `/${nm}/${roomName}`;
        //   if(~Object.keys(io.nsps).indexOf(room)) return;
        //   let groupNsp = io.of(room);
        //
        //   console.log('new room:', room);
        //
        //   io.of(nm).emit('newRoom', roomName);
        //
        //   groupNsp.on('connection', socket => {
        //     socket.on('message', (data) => {
        //       let msg = {
        //         message: data.message,
        //         from: 'USER',
        //         time: new Date()
        //       };
        //       groupNsp.emit('message', msg);
        //     });
        //   });
        // };
        next();
    };
};
