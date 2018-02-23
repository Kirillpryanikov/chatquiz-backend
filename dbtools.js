'use strict';
require('dotenv').config();

const path              = require('path');
const dateformat        = require('dateformat');
const fs                = require('fs');
const Datastore         = require('nedb-promises');
const pmx               = require('./utils/keymetrics');
const logger            = require('./utils/logger');

const HISTORY_MAX_SIZE  = parseInt(process.env.HISTORY_MAX_SIZE);

if (!fs.existsSync('./databases'))
    fs.mkdirSync('./databases');

let rooms    = new Datastore({ filename: './databases/rooms.db', autoload: true}) ,
    messages = new Datastore({ filename: './databases/messages.db', autoload: true});


const probe             = pmx.probe();
const dbProbe  = probe.metric({
    name    : 'Database file size'
});


const dbFileSize = () => {
    try {
        const statsRooms = fs.statSync("databases/rooms.db");
        const statsMessages = fs.statSync("databases/messages.db");
        const size = statsRooms.size + statsMessages.size;
        dbProbe.set(size);
        logger.info("DB file size calculated", { size: size });
    } catch(e) {
        logger.error("Error while calculating db file size", { error: e });
    }
};

setInterval(dbFileSize, 60000);

dbFileSize();

module.exports = {
    message: {
        getHistory: (room, user_id, page) => {
            return new Promise((resolve, reject) => {

                if (!page)
                    page = 0;

                try {

                    const skip = parseInt(page) * parseInt(process.env.HISTORY_LIMIT);
                    const limit = parseInt(process.env.HISTORY_LIMIT);


                    messages.find({room: room})
                        .skip(skip)
                        .limit(limit)
                        .sort({ time: -1, _id: -1})
                        .then(
                            (records) => {

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

                                resolve(msgs.reverse());

                            });
                } catch (e) {
                    reject([]);
                }
            });

        },
        setMessage: data => {
            return new Promise((resolve, reject) => {
                try {

                    messages.count({ 'room': data.room })
                        .then(
                            countOfMsg => {

                                if (countOfMsg > HISTORY_MAX_SIZE) {

                                    let difference = Math.abs(countOfMsg - HISTORY_MAX_SIZE);

                                    messages.find({ 'room': data.room }).sort({time: 1, _id: -1}).limit(difference)
                                        .then(
                                            all_msgs => {
                                                for (let i = 0; i < all_msgs.length; i++) {
                                                    messages.remove({'_id': all_msgs[i]._id});
                                                }
                                            }
                                        );

                                }

                                messages.insert(data)
                                    .then(
                                        message => {
                                            resolve(message._id);
                                        }
                                    );
                            }
                        ).catch(reject);

                }
                catch (e) {
                    reject();
                }
            })
        },
        setLike: (data) => {
            return new Promise((resolve, reject) => {

                if (!data.message_id)
                {
                    reject();
                    return;
                }

                try {
                    messages.findOne({_id: data.message_id})
                        .then(
                            message => {

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


                                messages.update({_id: data.message_id}, message);

                                let result = {
                                    message_id: data.message_id,
                                    count: message.likes.length,
                                    user_id: data.user_id
                                };

                                resolve(result);


                            }
                        )
                        .catch(
                            e => reject()
                        )
                }
                catch (e) {
                    reject();
                }


            });
        },
        downloadHistory: (room) => {

            return new Promise((resolve, reject) => {

                messages.find({'room': room}).sort({ time: -1, _id: -1})
                    .then(response => {
                        resolve(response);
                    })
                    .catch((e) => reject(e))

            })

        }
    },
    room: {
        getTopic: (roomId) => {

            return new Promise((resolve, reject) => {

                try {
                    rooms.findOne({ room_id: roomId })
                        .then((room) => {

                            if (!room) {
                                rooms.insert({room_id: roomId, topic: ''});
                                resolve(null);
                            }
                            else
                                resolve(room.topic);

                        });


                } catch (e) {
                    console.log('Err: ', e);
                    reject();
                }

            });


        },
        setTopic: (room, topic) => {

            return new Promise((resolve, reject) => {

                try {

                    const _topic = topic.substring(0, parseInt(process.env.TOPIC_LENGTH));

                    rooms.update({ room_id: room }, { topic: _topic, room_id: room }, { upsert: true })
                        .then(
                            () => {
                                resolve(_topic);
                            }
                        )
                        .catch(
                            reject
                        )

                }
                catch (e) {
                    reject();
                }

            });

        }
    }
};