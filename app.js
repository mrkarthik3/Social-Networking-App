const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const app = express();

// Boiler plate session configuration settings
// By default session namager will store this session data
// in memory, but we can override with 'store' property.
let sessionOptions = session({
  secret: "JavaScript is sooo cool!",
  // Your secret could be anything! Something no one could guess
  store: new MongoStore({ client: require("./db") }),
  // This creates a new collection in the DB with name 'sessions'
  // where all session data is saved.
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
  // 1000 -> 1000 ms = 1 sec.
  // Above line implies cookie is valid for 24 hours
});

app.use(sessionOptions);

const router = require("./router");

app.use(express.urlencoded({ extended: false }));
// It tells Express to add user submitted form data
// into request (req) object.
// We can access that data using req.body
app.use(express.json());
// This is for sending JSON data b/w files
// inside the project

// Above 2 lines of code will help Express to
// read both form submitted data and general
// data in the form of JSON.

app.use(express.static("public"));
app.set("views", "views");
// First argument is "views". It is an express option.
// Second argument is folder name "views"
app.set("view engine", "ejs");

app.use("/", router);
// All requests are directed to router

// app.listen(3000);

module.exports = app;
