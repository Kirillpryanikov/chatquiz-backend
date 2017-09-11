'use strict';

const db = require('./config/db/models');
const path = require('path');
require('dotenv').config({
    path: path.resolve('.env')
});

module.exports = {
    message: {
        get_history: function (room, user_id, page, cb) {
            if (!page) {
                page = 0;
            }
            db.Message.find({room: room}, function (err, resp) {
                if (err) {
                    console.log('Message get_history');
                }
                let messages = resp.map(function (e) {
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
                cb(null, messages.reverse());
            }).skip(parseInt(page) * parseInt(process.env.HISTORY_LIMIT))
                .limit(parseInt(process.env.HISTORY_LIMIT))
                .sort({_id: -1});
        },
        download_history: function (cb) {
            db.Message.find(function (err, resp) {
                if (err) {
                    console.log('Download history error');
                } else {
                    cb(null, resp);
                }
            });
        },
        set_message: function (data) {
            return db.Message.create(data, function (err, resp) {
                if (err) {
                    console.log('Message set_message', err);
                } else {
                    return resp._id;
                }
            });
        },
        set_like: function (data, cb) {
            if (data.message_id) {
                db.Message.findOne({_id: data.message_id}, function (err, list) {
                    if (err) {
                        console.log('error setLike');
                    } else {
                        if (list && list.likes.length > 0) {
                            list.likes.find(function (e, i, arr) {
                                if (e && e.user === data.user_id) {
                                    list.likes.splice(i, 1);
                                } else {
                                    if (!arr[i + 1]) {
                                        list.likes.push({user: data.user_id});
                                    }
                                }
                            });
                        } else {
                            list.likes.push({user: data.user_id});
                        }

                        list.save(function (err) {
                            if (err) {
                                console.log('error save:', err);
                            } else {
                                let result = {
                                    message_id: data.message_id,
                                    count: list.likes.length,
                                    user_id: data.user_id
                                };
                                cb(null, result);
                            }
                        });
                    }
                });
            }
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