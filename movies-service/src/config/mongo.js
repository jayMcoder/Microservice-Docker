const MongoClient = require('mongodb');

const getMongoURL = (options) => {
  const url = 'mongodb://' + options.user + ':' + options.pass + '@' + options.servers; // options.servers.reduce((prev, cur) => prev + `${cur.ip}:${cur.port},`, 'mongodb://');
  console.log(url);
  return `${url.substr(0, url.length - 1)}/${options.db}`;
};

const connect = (options, mediator) => {
  mediator.once('boot.ready', () => {
    MongoClient.connect(getMongoURL(options), {
      db: options.dbParameters(),
      server: options.serverParameters(),
      replset: options.replsetParameters(options.repl)
    }, (err, db) => {
      if (err) {
        mediator.emit('db.error', err);
      }
      mediator.emit('db.ready', db);
    });
  });
};

module.exports = Object.assign({}, {
  connect
});
