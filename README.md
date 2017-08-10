## Chat microservice for LNO

### Instalation
```git clone https://github.com/Growish/chat-service.git```

```cd chat-service```

```npm install```

```bower install```

------


For local developing server

```npm start pm2.config.json```

For staging:

```npm start pm2.config.json --env staging```

For production:

```npm start pm2.config.json --env production```

Environments variables are set using PM2. For updating variables values while server is running use: ```--update-env```