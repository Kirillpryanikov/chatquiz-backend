const winston = require('winston');
const fs      = require('fs');
winston.emitErrs = true;


if (!fs.existsSync('./log'))
    fs.mkdirSync('./log');

const expressLogger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: './log/http-access.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'info',
            handleExceptions: true,
            json: false,
            colorize: false
        })
    ],
    exitOnError: false
});

const serverLogger = new winston.Logger({
    transports: [
        new winston.transports.File({
            name: 'errorfile',
            level: 'error',
            filename: './log/server-error.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.File({
            name: 'combinedfile',
            filename: './log/server-combined.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            name: 'console',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = serverLogger;
module.exports.stream = {
    write: function(message, encoding){
        expressLogger.info(message);
    }
};