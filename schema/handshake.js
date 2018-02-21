const Joi = require('joi');

module.exports = Joi.object().keys({
    token: Joi.string().min(2).max(128).required(),
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    room: Joi.string().min(2).max(64).required(),
});