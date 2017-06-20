const status = require('http-status');

module.exports = (app, options) => {
  const {
    database
  } = options;
  app.get('/movies', (req, res, next) => {
    database.getAllMovies().then((movies) => {
      res.status(status.OK).json(movies);
    }).catch(next);
  });

  app.get('/movies/premieres', (req, res, next) => {
    database.getMovieListing().then((movies) => {
      res.status(status.OK).json(movies);
    }).catch(next);
  });

  app.get('/movies/:id', (req, res, next) => {
    database.getMovieById(req.params.id).then((movie) => {
      res.status(status.OK).json(movie);
    }).catch(next);
  });
};
