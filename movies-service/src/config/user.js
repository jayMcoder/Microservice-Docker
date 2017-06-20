const admin = db.getSiblingDB('admin');
const movieListing = db.getSiblingDB('movielisting');

admin.auth('adminMongodb', 'adminMongodb2017');

// Create DB user
movieListing.createUser({
  user: 'dbMovielisting',
  pwd: 'dbMovielistingMongodb2017',
  roles: ['dbOwner']
});
