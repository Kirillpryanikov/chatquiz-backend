const Joi = require('joi');

module.exports = Joi.object().keys({
    token: Joi.string().min(2).max(128),
    userId: Joi.string().min(2).max(128),
    room: Joi.string().min(2).max(64).required(),
});