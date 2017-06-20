const admin = db.getSiblingDB('admin');
const ccenter = db.getSiblingDB('ccenter');
const cineHalls = db.getSiblingDB('cinehalls');


const SERVICES = ['movies-service'];

// Create admin user
admin.createUser({
  user: 'adminMongodb',
  pwd: 'adminMongodb2017',
  roles: [{
    role: 'userAdminAnyDatabase',
    db: 'admin'
  }]
});

admin.auth('adminMongodb', 'adminMongodb2017');

// Authenticate to create the other user
admin.createUser({
  user: 'replicaAdmin',
  pwd: 'replicaMongodb2017',
  roles: [{
    role: 'clusterAdmin',
    db: 'admin'
  }]
});

// Create DB user
ccenter.createUser({
  user: 'dbCcenter',
  pwd: 'dbCcenterMongodb2017',
  roles: ['dbOwner']
});

// Create DB user
cineHalls.createUser({
  user: 'dbCinecatalog',
  pwd: 'dbCinecatalogMongodb2017',
  roles: ['dbOwner']
});
