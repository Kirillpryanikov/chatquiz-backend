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



module.exports = {
    Room: mongoose.model('Room', Room)
};