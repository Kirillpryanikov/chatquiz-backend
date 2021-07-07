## Chat microservice for LNO

```npm install```

```create a file .env according to CTO instructions```


------------------------------------------------------


To download history make a GET to serviceIP:port/download_history/:room with X-master-token as request header.

Environments variables are set using PM2. For updating variables values while server is running use: ```--update-env```