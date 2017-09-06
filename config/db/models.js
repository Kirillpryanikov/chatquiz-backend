const mongoose = require('mongoose');

let Room = new mongoose.Schema({
    room_id: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: false
    }
});

let Message = new mongoose.Schema({
    message: String,
    image: String,
    from: Object,
    likes: [
        {user: String}
    ],
    time: {type: Date, default: Date.now, required: true},
    room: String
});

module.exports = {
    Room: mongoose.model('Room', Room),
    Message: mongoose.model('Message', Message)
};