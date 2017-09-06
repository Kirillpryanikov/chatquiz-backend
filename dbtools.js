'use strict';

const db = require('./config/db/models');
const path = require('path');
require('dotenv').config({
    path: path.resolve('.env')
});

module.exports = {
    message: {
        get_history: function (room, user_id, page, cb) {
            db.Message.find({room: room}, function (err, resp) {
                if (err) {
                    console.log('Message get_history');
                }
                let messages = [];
                messages = resp.map(function (e) {
                    let msg = {
                        message: e.message,
                        msg_id: e._id,
                        likes: e.likes.length,
                        time: e.time,
                        from: e.from,
                        image: e.image
                    };
                    e.likes.find(function (el) {
                        if (el.user === user_id) {
                            msg.liked = true;
                        }
                    });
                    return msg;
                });
               // console.log('messages : ', messages);
                cb(null, messages);
            }).skip(0 * parseInt(process.env.HISTORY_LIMIT)).limit(parseInt(process.env.HISTORY_LIMIT));
        },
        set_message: function (message) {
            return db.Message.create(message, function (err, resp) {
                if (err) {
                    console.log('Message set_message', err);
                } else {
                    return resp._id;
                }
            });
        }
    },
    room: {
        get_topic: function (room, cb) {
            db.Room.findOne({room_id: room}, function (err, topic) {
                if (err) {
                    console.log('Mongo Update Err: ', err);
                    return false;
                }
                if (topic && topic.topic) {
                    cb(null, topic.topic);
                }
            });
        },
        set_topic: function (room, topic) {
            let resp = topic.substring(0, process.env.TOPIC_LENGTH);
            db.Room.update({room_id: room}, {topic: topic}, {upsert: false}, function (err) {
                if (err) {
                    console.log('Room update false', err);
                }
                return resp;
            });
        }
    }
}