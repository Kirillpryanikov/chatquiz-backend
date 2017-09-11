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
});

Message.pre('save', function (next, done) {
    mongoose.models['Message'].find({}, function(err, data) {
        if (err){
            return next(err);
        }
        if (data.length >= HISTORY_MAX_SIZE) {
            let countOfIndex = data.length - HISTORY_MAX_SIZE;
            let ids = [];
            for (let i=0; i < countOfIndex; i++) {
                if(data[i] && data[i]._id) {
                    ids[i] = data[i]._id;
                }
            }
            ids.forEach((mes) => {
                mongoose.models['Message'].remove({'_id': mongoose.Types.ObjectId(mes)}, function () {
                });
            });
        }
    });
    next();
});

module.exports = {
    Room: mongoose.model('Room', Room),
    Message: mongoose.model('Message', Message)
};