## Chat microservice for LNO

### Instalation
```git clone https://github.com/Growish/chat-service.git```

```cd chat-service```

```npm install```

```bower install```

```gulp```

```create and config file .env like env.example```

```Create a .env file like env.example```
------



For local developing server

```pm2 start pm2.config.json```

For staging:

```pm2 start pm2.config.json --env staging```

For production:

```pm2 start pm2.config.json --env production```

Environments variables are set using PM2. For updating variables values while server is running use: ```--update-env```