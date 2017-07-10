#ChatQuiz app

---
## Server
For local development:

` node index.js `

For staging:

` npm run start:pm2:dev`

For production:

` npm run start:pm2:prod`

To stop the server:

`npm run stop:pm2`

To restart server:

`npm run restart:pm2`

To show status:

`npm run status:pm2`

## Front
```
npm install
npm install -g gulp (if needed)
gulp
```
http://localhost:8080/quiz/#/:room/quiz
http://localhost:8080/imagechat/#/:room/chat
