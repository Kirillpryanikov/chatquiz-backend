require("dotenv").config();

const logger    = require('./utils/logger');
const express   = require("express");
const http      = require("http");
const cors      = require("cors");
const socketIO  = require("socket.io");
const process   = require("process");


const apiProxyController        = require('./controllers/api-proxy');
const historyController         = require('./controllers/history');
const downloadHistoryController = require('./controllers/download-history');
const socketModule          = require('./controllers/socket');

const app = express();



const port = process.env.GW_SERVER_PORT;
const server = http.createServer(app);
const io = socketIO(server);

process.title = "chatMicroS";


app.use(require('morgan')("combined", { "stream": logger.stream }));
app.use(cors());


app.use('/apiproxy', apiProxyController);
app.get("/history/:room/:page", historyController);
app.get("/download_history/:room", downloadHistoryController);


app.use(function(req, res) {
    logger.error("HTTP error  url:" + req.url);
    res.status(404).send("Sorry cant find that!");
});

socketModule.setIO(io);
io.sockets.on("connection", socketModule.controller);

server.listen(port, () => {
    logger.info(`Socket server started listen on port: ${port}`);
});