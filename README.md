## Chat microservice for LNO

### Instalation
```git clone https://github.com/Growish/chat-service.git```

```cd chat-service```

```npm install```

```bower install```

```gulp```

```create and config file .env like env.example```
------



For local developing server

```npm run start:pm2:dev```

For staging:

```npm run start:pm2:stage```

For production:

```npm run start:pm2:prod```

Environments variables are set using PM2. For updating variables values while server is running use: ```--update-env```

### Download history
To download the message history, go to the URL ```http://youdomain.name/download_history``` and provide a token to confirm the user. 
After that, file will load to you computer as _history.json_.