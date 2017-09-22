'use strict';

require("babel-polyfill");
const path = require('path');
const dateformat = require('dateformat');
require('dotenv').config({
    path: path.resolve('.env')
});
const HISTORY_MAX_SIZE = parseInt(process.env.HISTORY_MAX_SIZE);
const Datastore = require('nedb-promises');

// Connection to collections
// If the file does not exist,it will be created automatically (bases on promises)
let rooms    = new Datastore({ filename: './databases/rooms.db', autoload: true}) ,
    messages = new Datastore({ filename: './databases/messages.db', autoload: true});

module.exports = {
    message: {
        get_history: async (room, user_id, page, cb) => {
            if (!page) {
                page = 0;
            }

            try {     
                let records = await messages.find({room: room})
                    .skip(parseInt(page) * parseInt(process.env.HISTORY_LIMIT))
                    .limit(parseInt(process.env.HISTORY_LIMIT))
                    .sort({ time: -1, _id: -1});

                let msgs = records.map( el => {
                    let msg = {
                        message: el.message,
                        msg_id: el._id,
                        likes: el.likes.length,
                        time: dateformat(new Date(el.time), "HH:MM"),
                        from: el.from,
                        image: el.image
                    };

                    el.likes.find( like => {
                        if (like.user === user_id) {
                            msg.liked = true;
                        }
                    });


                    return msg;
                });

                cb(null, msgs.reverse());

            } catch (e) {
                console.log('Message get_history: ', e);
            }
        },
        download_history: async (room, cb) => {
            try {
                let response = await messages.find({'room': room}).sort({ time: -1, _id: -1});
                cb(null, response);
            } catch (e) {
                cb(e, null);
            }
        },
        set_message: async (data) => {
            try {
                let countOfMsg = await messages.count({ 'room': data.room });

                if (countOfMsg > HISTORY_MAX_SIZE) {
                    let difference = Math.abs(countOfMsg - HISTORY_MAX_SIZE);
                    let all_msgs = await messages.find({ 'room': data.room }).sort({time: 1, _id: -1}).limit(difference);

                    for (let i = 0; i < all_msgs.length; i++) {
                        await messages.remove({'_id': all_msgs[i]._id});
                    }
                }
                let message = await messages.insert(data);

                return message._id;
            } catch (e) {
                console.log('Message set_message: ', e);
                return;
            }
        },
        set_like: async (data, cb) => {

            if (data.message_id) {
                try {
                    let message = await messages.findOne({_id: data.message_id});

                    if (message && message.likes.length > 0) {
                        message.likes.find( (e, i, array) => {
                            if (e && e.user === data.user_id) {
                                message.likes.splice(i, 1);
                            } else {
                                if (!array[i + 1]) {
                                    message.likes.push({ user: data.user_id });
                                }
                            }
                        });
                    } else {
                        message.likes.push({ user: data.user_id });
                    }

                    try {
                        await messages.update({_id: data.message_id}, message);
                        let result = {
                            message_id: data.message_id,
                            count: message.likes.length,
                            user_id: data.user_id
                        };
                        cb(null, result);
                    } catch (e) {
                        console.log('error save: ', e);
                        return;
                    }

                }
                catch (e) {
                    console.log('error setLike: ', e);
                }
            }
        }
    },
    room: {
        get_topic: async (room, cb) => {
            try {
                let topic = await rooms.findOne({ room_id: room });

                if (!topic) {
                    topic = await rooms.insert({ room_id: room, topic: '' })
                }
                cb(null, topic.topic);
            } catch (e) {
                console.log('Err: ', e);
                return false;
            }
        },
        set_topic: async (room, topic) => {
            try {
                const _topic = topic.substring(0, parseInt(process.env.TOPIC_LENGTH));
                await rooms.update({ room_id: room }, { topic: _topic, room_id: room }, { upsert: true });
                console.log(_topic);
                return _topic;
            } catch (e) {
                console.log('Room update false: ', e);
                return;
            }
        }
    }
}