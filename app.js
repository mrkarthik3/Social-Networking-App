// This is where we enable new features in our Express application.
// This is because... Express is starting from this file only!

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const markdown = require('marked')
const app = express();
const sanitizeHTML = require('sanitize-html')

// Boiler plate session configuration settings
// By default session namager will store this session data
// in server memory, but we can override with 'store' property
// and store in MongoDB collection with name "sessions"
let sessionOptions = session({
  secret: "JavaScript is sooo cool!",
  // Your secret could be anything! Something no one could guess
  store: new MongoStore({ client: require("./db") }),
  // This causes mongoDB client to create a new collection in the DB
  // with name 'sessions'
  // where all session data is saved.
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
  // 1000 -> 1000 ms = 1 sec.
  // Above line implies cookie is valid for 24 hours
});

app.use(sessionOptions);
app.use(flash());


// We need to pass session data into tempates
// so that they show relevant data. So far...
// we are manually passing session data ... but with a middle ware function like below
// it becomes possible to reduce code duplication.
app.use(function(req, res, next){
  // make our markdown function available from within ejs templates
  res.locals.filterUserHTML = function(content) {
    return sanitizeHTML(markdown(content),{allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {}})
  }


  // make all error and success messages available from all templates.

  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")


  // make current user id available on the req object
  if (req.session.user) { req.visitorId =req.session.user._id}
  else {req.visitorId = 0}

  // make user session data available from within view templates
  res.locals.user = req.session.user
  next()
})

/*
This  locals object will be available from within the EJS templates.
We can add any objects/properties on to this locals object.

Also, this function is run for every request.

Note that this is before the router. 
Therefore... this will run first and because of next()
express will then move on to run functions for that particular route.

Overall, this will ensure that we have access to user property from all of our EJS 
templates.
*/

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
