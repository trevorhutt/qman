const http = require('http');
const routeApp = require('./app');
const server = http.createServer(routeApp);

// require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');


process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
//app.use(jwt());


//app.use('/users', require('./users/users.controller'));

// start server
const port = process.env.NODE_ENV === 'production' ? 80 : 3000;


server.listen(4000);
