admin = db.getSiblingDB("admin");
ccenter = db.getSiblingDB("ccenter");
cineCatalog = db.getSiblingDB("cinecatalog");
movieListing = db.getSiblingDB("movielisting");

// Create admin user
admin.createUser({
  user: "adminMongodb",
  pwd: "adminMongodb2017",
  roles: [{
    role: "userAdminAnyDatabase",
    db: "admin"
  }]
});

admin.auth("adminMongodb", "adminMongodb2017");

// Authenticate to create the other user
admin.createUser({
  user: "replicaAdmin",
  pwd: "replicaMongodb2017",
  roles: [{
    role: "clusterAdmin",
    db: "admin"
  }]
});

// Create DB user
ccenter.createUser({
  user: "dbCcenter",
  pwd: "dbCcenterMongodb2017",
  roles: ["dbOwner"]
});

// Create DB user
cineCatalog.createUser({
  user: "dbCinecatalog",
  pwd: "dbCinecatalogMongodb2017",
  roles: ["dbOwner"]
});

// Create DB user
movieListing.createUser({
  user: "dbMovielisting",
  pwd: "dbMovielistingMongodb2017",
  roles: ["dbOwner"]
});
