const Joi = require('joi');

module.exports = Joi.object().keys({
    allowAnonymousUsers: Joi.boolean().required(),
    anonymousSessionCount: Joi.number().integer()
});