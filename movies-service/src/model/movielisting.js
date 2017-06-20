const movielisting = (db) => {
  const collection = db.collection('movies');

  const getAllMovies = () => new Promise((resolve, reject) => {
    const movies = [];
    const cursor = collection.find({}, {
      title: 1,
      id: 1
    });
    const addMovie = (movie) => {
      movies.push(movie);
    };
    const sendMovies = (err) => {
      if (err) {
        reject(new Error('An error occured fetching all movies, err: ' + err));
      }
      resolve(movies.slice());
    };
    cursor.forEach(addMovie, sendMovies);
  });

  const getMovieListing = () => new Promise((resolve, reject) => {
    const movies = [];
    const currentDay = new Date();
    const query = {
      releaseYear: {
        $gt: currentDay.getFullYear() - 1,
        $lte: currentDay.getFullYear()
      },
      releaseMonth: {
        $gte: currentDay.getMonth() + 1,
        $lte: currentDay.getMonth() + 2
      },
      releaseDay: {
        $lte: currentDay.getDate()
      }
    };
    const cursor = collection.find(query);
    const addMovie = (movie) => {
      movies.push(movie);
    };
    const sendMovies = (err) => {
      if (err) {
        reject(new Error('An error occured fetching all movies, err: ' + err));
      }
      resolve(movies);
    };
    cursor.forEach(addMovie, sendMovies);
  });

  const getMovieById = id => new Promise((resolve, reject) => {
    const projection = {
      _id: 0,
      id: 1,
      title: 1,
      format: 1
    };
    const sendMovie = (err, movie) => {
      if (err) {
        reject(new Error('An error occured fetching a movie with id: ${id}, err: ${err}'));
      }
      resolve(movie);
    };
    collection.findOne({
      id: id
    }, projection, sendMovie);
  });

  const disconnect = () => {
    db.close();
  };
  console.log('DB Connected return value');
  return Object.create({
    getAllMovies,
    getMovieListing,
    getMovieById,
    disconnect
  });
};

const connect = connection => new Promise((resolve, reject) => {
  if (!connection || Object.keys(connection).length === 0) {
    reject(new Error('conection db not supplied'));
  }
  let cache = [];
  const conn = JSON.stringify(connection, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null;
  //console.log('connection... ' + conn);
  resolve(movielisting(connection));
});

module.exports = Object.assign({}, {
  connect
});
