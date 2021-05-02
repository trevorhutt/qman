//require('rootpath')()
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('./middleware/jwt')
const errorHandler = require('./middleware/error-handler')
const token = require('./middleware/token')
const config = require('./config.js');

const queueRoutes = require('./api/v1/routes/messagequeue')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.all('/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Access-Token,X-Key,Authorization,X-Requested-With,Origin,Access-Control-Allow-Origin,Access-Control-Allow-Credentials')
  if (req.method === 'OPTIONS') {
    res.status(200).end()
  } else {
    next()
  }
})


app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


const logRequestStart = (req, res, next) => {
  console.info(`${req.method} ${req.originalUrl}`) 
  
  res.on('finish', () => {
      console.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`)
  })
  
  next()
}

if (config.debug) app.use(logRequestStart);

// use JWT auth to secure the api
app.use(jwt())

// End that do not require authentication
app.use('/v1/messages', queueRoutes)

//Application

// No matching route
app.use((req, res) => {
  const error = new Error(req.path + ' Not found')
  error.status = 404
  res.status(404).json({message: req.path + ' Not found'})
})


module.exports = app


