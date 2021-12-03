const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const http = require('http');
const appconfig = require('./config/appconfig');
const logger = require('./app/libraries/logger');
const routeLoggerMiddleware = require('./app/middleware/routeLogger');
const globalErrorMiddleware = require('./app/middleware/appErrorHandler');
const mongoose = require('mongoose');
const morgan = require('morgan');


const modelsPath = './app/model';
const controllersPath = './app/controller';
const libsPath = './app/libraries';
const middlewaresPath = './app/middleware';
const routesPath = './app/routes';


app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static('public'))
 app.use(express.static(path.join(__dirname, 'public')));
//  app.use(express.static('files'))
app.use(routeLoggerMiddleware.logIp);
app.use(globalErrorMiddleware.globalErrorHandler);


app.use('/chat',express.static(path.join(__dirname, 'client')));

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  next();
});
  
 
  
  
  fs.readdirSync(modelsPath).forEach(function(file){
    if(~file.indexOf('.js'))require(modelsPath+ '/' + file)
  })

  fs.readdirSync(routesPath).forEach(function(file){
    if(~file.indexOf('.js')){
      console.log('include the files')
      console.log(routesPath+'/'+file)
      let route = require(routesPath + '/' + file)
      route.setRoute(app)
    }
  })
  
  app.use(globalErrorMiddleware.globalNotFoundHandler)
  
  
const server = http.createServer(app)
console.log(appconfig)
server.listen(appconfig.port, appconfig.host)
server.on('error',onError)
server.on('listening',onListening)



const socket = require('./app/libraries/socket')
// console.log(socket,'sock...')
console.log(socket.setServer(server),'ser...')
const socketServer = socket.setServer(server)

  
mongoose.connection.on('err',function(err){
  console.log("database error")
  console.log(err)
  logger.error(err,'mongoose connection on error handler', 10)
})
mongoose.connection.on('open',function(err){
  if(err){
    console.log("database connection error")
    console.log(err)
    logger.error(err,'mongoose connection open handler', 10)
  }else {
    console.log("database connection open")
    logger.info("database connection open",
    'database connection open handler', 10)
  }
})
  
  function onError(error) {
    console.log(error);
    if (error.syscall !== 'listen') {
        logger.error(error.code + ' not equal listen', 'serverOnErrorHandler', 10)
        throw error
    }
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            logger.error(error.code + ':elavated privileges required', 'serverOnErrorHandler', 10)
            process.exit(1)
            break
        case 'EADDRINUSE':
        logger.error(error.code + ':port is already in use.', 'serverOnErrorHandler', 10)
            process.exit(1)
            break
        default:
            logger.error(error.code + ':some unknown error occured', 'serverOnErrorHandler', 10)
            throw error
    }
  }
  
 
  function onListening() {
    var addr = server.address()
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    ('Listening on ' + bind)
    logger.info('server listening on port' + addr.port, 'serverOnListeningHandler', 10)
    setTimeout(() => {
      let db = mongoose.connect(appconfig.db.uri)
    }, 1000);
  }
  
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
    // application specific logging, throwing an error, or other logic here
  })
    
 module.exports = app