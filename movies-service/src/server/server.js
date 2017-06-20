const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const movieAPI = require('../api/movies');

const start = options => new Promise((resolve, reject) => {
  if (!options.database) {
    reject(new Error('The server must be started with a connected database'));
  }
  if (!options.port) {
    reject(new Error('The server must be started with an available port'));
  }

  const app = express();
  app.use(morgan('dev'));
  app.use((err, req, res, next) => {
    reject(new Error('Something went wrong!, err: ' + err));
    res.status(500).send('Something went wrong!');
  });

  movieAPI(app, options);

  const server = app.listen(options.port, () => resolve(server));
});

module.exports = Object.assign({}, {
  start
});
