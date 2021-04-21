const mongodb = require("mongodb");

const connectionString =
  "mongodb+srv://dbuser1:Password123@cluster0.wkcvn.mongodb.net/complexapp?retryWrites=true&w=majority";

mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, client) {
    module.exports = client.db();
    // This will return database whenever
    // This db.js file is called from another JS file.

    // Start Express app only when
    // Database is connected.
    // Because only then the database
    // data is returned into module.exports. So that others can use it.

    const app = require("./app");
    app.listen(3000);

    // We exported app.js and  loaded into this db.js file.
    // When database connection is made,
    // Then we are running the app and
    // this app starts listening at port
    // 3000
  }
);
