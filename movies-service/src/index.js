const {
  EventEmitter
} = require('events');
const server = require('./server/server');
const movielisting = require('./model/movielisting');
const config = require('./config/config');
const mongo = require('./config/mongo');

const mediator = new EventEmitter();

console.log('---- Movies Service ----');
console.log('Connecting to movielisting database');

process.on('uncaughtRejection', (err, promise) => {
  console.error('Unhandled Rejection', err);
});

mediator.on('db.ready', (db) => {
  let mdb;
  movielisting.connect(db).then((dbconnected) => {
    console.log('Repository Connected. Starting Server');
    mdb = dbconnected;
    return server.start({
      port: config.serverSettings.port,
      database: dbconnected
    });
  }).then((app) => {
    console.log(`Server started successfully, running on port: ${config.serverSettings.port}.`);
    app.on('close', () => {
      mdb.disconnect();
    });
  });
});

mediator.on('db.error', (err) => {
  console.log(err);
});

mongo.connect(config.dbSettings, mediator);

mediator.emit('boot.ready');
