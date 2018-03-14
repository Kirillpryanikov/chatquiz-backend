const Joi = require('joi');

module.exports = Joi.string().min(0).max(300).required();