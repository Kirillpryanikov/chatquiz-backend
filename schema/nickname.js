const Joi = require('joi');

module.exports = Joi.string().min(2).max(25).required();