const mongoose = require('mongoose');
const path = require('path');
const process = require('process');
require('dotenv').config({
    path: path.resolve('.env')
});

const HISTORY_MAX_SIZE = parseInt(process.env.HISTORY_MAX_SIZE);

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
}, {capped: {size: 10000000000, max: HISTORY_MAX_SIZE, autoIndexId: true}});

module.exports = {
    Room: mongoose.model('Room', Room),
    Message: mongoose.model('Message', Message)
};