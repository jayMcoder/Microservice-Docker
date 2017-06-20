const movieListing = db.getSiblingDB('movielisting');

movieListing.auth('dbMovielisting', 'dbMovielistingMongodb2017');

movieListing.movies.insertMany([{
  id: '1',
  title: 'Assasins Creed',
  runtime: 115,
  format: 'IMAX',
  plot: 'Lorem ipsum dolor sit amet',
  releaseYear: 2017,
  releaseMonth: 5,
  releaseDay: 6
  }, {
  id: '2',
  title: 'Pirates of the Caribbean: Dead Men Tell No Tales',
  runtime: 124,
  format: 'IMAX',
  plot: 'Lorem ipsum dolor sit amet',
  releaseYear: 2017,
  releaseMonth: 6,
  releaseDay: 13
  }, {
  id: '3',
  title: 'xXx: Return of Xander Cage',
  runtime: 107,
  format: 'IMAX',
  plot: 'Lorem ipsum dolor sit amet',
  releaseYear: 2017,
  releaseMonth: 5,
  releaseDay: 25
  }, {
  id: '4',
  title: 'Resident Evil: The Final Chapter',
  runtime: 107,
  format: 'IMAX',
  plot: 'Lorem ipsum dolor sit amet',
  releaseYear: 2017,
  releaseMonth: 6,
  releaseDay: 27
  }, {
  id: '5',
  title: 'Moana',
  runtime: 114,
  format: 'IMAX',
  plot: 'Lorem ipsum dolor sit amet',
  releaseYear: 2017,
  releaseMonth: 7,
  releaseDay: 2
}]);
