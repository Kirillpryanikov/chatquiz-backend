'use strict';

const process           = require("process");

const logger            = require('./utils/logger');
const MongoClient       = require('mongodb').MongoClient;
const ObjectId          = require('mongodb').ObjectID;
const Joi               = require('joi');
const uuidv1            = require('uuid/v1');

const roomConfigSchema  = require('./schema/roomConfig');
const HISTORY_MAX_SIZE  = parseInt(process.env.HISTORY_MAX_SIZE);

let messages;
let rooms;

logger.info("Connecting to DB", { server: process.env.MONGO_SERVER });

MongoClient.connect(process.env.MONGO_SERVER, function(err, client) {

    if(err) {
        logger.error("Can't connect to DB", {error: err});
        throw 'DB CONNECTION ERROR';
    }

    messages = client.db('chat').collection('messages');
    rooms    = client.db('chat').collection('rooms');

    logger.info("Connected successfully to MongoDB server");
});

const roomDefaultSchema = (room) => {
    return {
        room_id: room,
        topic: '',
        participants: [],
        config: {
            allowAnonymousUsers: true,
            anonymousSessionCount: 0
        }
    }
};

module.exports = {
    user: {
        get: (userId, room) => {

            return new Promise((resolve, reject) => {

                messages.find({room: room, "from.id": userId}).sort({ time: -1 }).limit(1).toArray((err, messages) => {

                    if(err) {
                        reject(err);
                        return;
                    }

                    if(messages.length <= 0) {
                        reject(null);
                        return;
                    }

                    resolve(messages[0].from);

                });

            });
        },
        generateAnonymous: (roomId) => {

            return new Promise((resolve, reject) => {

                rooms.findOneAndUpdate({ room_id: roomId }, { "$inc": { "config.anonymousSessionCount": 1 }}, (err, room) => {

                    if(err) {
                        reject(err);
                        return;
                    }

                    const count = room.value.config.anonymousSessionCount || 1;

                    const user = {
                        imageUrl: null,
                        anonymous: true,
                        name: 'anonimo-' + count,
                        id: uuidv1(),
                    };

                    resolve(user);

                })

            });


        }
    },
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
                        .toArray(
                            (err, records) => {

                                let msgs = records.map( el => {
                                    let msg = {
                                        message: el.message,
                                        id: el._id,
                                        likes: el.likes.length,
                                        time: el.time,
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
                    reject(e);
                }
            });

        },
        setMessage: data => {
            return new Promise((resolve, reject) => {
                try {

                    messages.count({ 'room': data.room }, (err, countOfMsg) => {

                        if(err) {
                            reject(err);
                            return;
                        }

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

                        messages.insertOne(data, (err, message) => {

                            if(err) {
                                reject(err);
                                return;
                            }

                            resolve(message.ops[0]);
                        });
                    })


                }
                catch (e) {
                    reject();
                }
            })
        },
        setLike: (data) => {
            return new Promise((resolve, reject) => {

                if (!data.id)
                {
                    reject();
                    return;
                }

                try {
                    messages.findOne({_id: new ObjectId(data.id)}, (err, message) => {

                        if(err) {
                            reject(err);
                            return;
                        }


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


                        messages.updateOne({_id: new ObjectId(data.id)}, message);

                        let result = {
                            id: data.id,
                            count: message.likes.length,
                            user_id: data.user_id
                        };

                        resolve(result);

                    })
                }
                catch (e) {
                    reject(e);
                }


            });
        },
        downloadHistory: (room) => {

            return new Promise((resolve, reject) => {

                messages.find({'room': room}).sort({ time: -1, _id: -1}, (err, response) => {

                    if(err) {
                        reject(err);
                        return;
                    }

                    resolve(response.toArray());
                })


            })

        }
    },
    room: {
        getTopic: (roomId) => {

            return new Promise((resolve, reject) => {

                try {
                    rooms.findOne({ room_id: roomId }, (err, room) => {

                        if(err) {
                            reject(err);
                            return;
                        }

                        if (!room) {
                            resolve(null);
                        }
                        else
                            resolve(room.topic);

                    })

                } catch (e) {
                    reject(e);
                }

            });


        },
        setTopic: (room, topic) => {

            return new Promise((resolve, reject) => {

                try {

                    const _topic = topic.substring(0, parseInt(process.env.TOPIC_LENGTH));

                    rooms.updateOne({ room_id: room }, { topic: _topic, room_id: room }, { upsert: true }, (err, response) => {

                        if(err) {
                            reject(err);
                            return;
                        }

                        resolve(_topic);
                    });

                }
                catch (e) {
                    reject();
                }

            });

        },
        get: (room) => {

            return new Promise((resolve, reject) => {

                try {
                    rooms.findOne({ room_id: room }, (err, roomFromDb) => {

                        if(err) {
                            reject(err);
                            return;
                        }

                        if (!roomFromDb) {
                            rooms.insertOne(roomDefaultSchema(room), (err, _room) => {

                                if(err) {
                                    reject(err);
                                    return;
                                }

                                resolve(_room.ops[0]);
                            });

                        }
                        else
                            resolve(roomFromDb);

                    });

                } catch (e) {
                    reject(e);
                }

            });

        },
        setConfig: (room, newConfig) => {

            return new Promise((resolve, reject) => {

                try {

                    rooms.findOne({ room_id: room }, (err, roomFromDb) => {

                        if(err) {
                            reject(err);
                            return;
                        }

                        let config = Object.assign(roomFromDb.config, newConfig);

                        const validation = Joi.validate(config, roomConfigSchema);

                        if(validation.error) {
                            reject(validation.error.message);
                            return false;
                        }


                        rooms.updateOne({ room_id: room }, { $set: { config: config }}, (err, response) => {

                            if(err) {
                                reject(err);
                                return;
                            }

                            resolve(config);
                        });

                    });


                }
                catch (e) {
                    logger.error("Error while setting room options", {
                        error: e
                    });
                    reject(e);
                }
            });

        },
        participant: (roomId, user, data) => {


            return new Promise((resolve, reject) => {

                try {

                    if(typeof data === 'undefined')
                        data = { };

                    rooms.findOne({room_id: roomId}, (err, roomFromDb) => {

                        if (err) {
                            reject(err);
                            return;
                        }

                        if(!roomFromDb) {
                            reject(null);
                            return;
                        }

                        let _participant = roomFromDb.participants.find((el) => {
                            return el.id === user.id;
                        });

                        if(_participant) {
                            //Update
                            let participant = Object.assign(_participant, user, data, { lastSeen: new Date() });

                            rooms.findOneAndUpdate({ room_id: roomId, "participants.id": user.id }, { $set: { "participants.$": participant }}, (err, response) => {

                                if(err) {
                                    reject(err);
                                    return;
                                }

                                resolve();
                                console.log(response.value);
                            });
                        }

                        else {
                            //Insert
                            let participant = Object.assign(user, {status: 'online', ban: false}, data, { lastSeen: new Date() });

                            rooms.findOneAndUpdate({ room_id: roomId }, { $push: { "participants": participant }}, (err, response) => {

                                if(err) {
                                    reject(err);
                                    return;
                                }

                                resolve();
                                console.log(response.value);
                            });


                        }




                    });
                }
                catch (e) {
                    reject(e);
                }




            });
        }
    }
};