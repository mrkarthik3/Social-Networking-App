const User = require("../models/User");

// Here 2 dots are required.. because Users.js is
// present inside 'models' folder that is on equal level of
// this folder 'controllers'

exports.home = function (req, res) {
  res.render("home-guest");
  // Renders the EJS template with name 'home-guest'
};

exports.login = function (req, res) {
  let user = new User(req.body);
  // This login is going to return a Promise
  // based on its definition inside User.js MODEL
  // So, we use .then and .catch to handle the Promise
  user
    .login()
    .then(function (result) {
      // when login() succeeds,
      // the function inside .then() is called.
      // It receives the 'resolve' from the Promise
      req.session.user = {};
      res.send(result);
    })
    .catch(function (e) {
      // when login() fails,
      // the function inside .catch() is called.
      // It receives the 'reject' from the Promise.
      res.send(e);
    });
  // Promise is used here.
  // Using a promise is as simple as
  // Saying what you want to do if the promise succeeds
  // inside the then() and..
  // Saying what you want to do if the promise fails
  // inside the catch()
};

exports.logout = function () {};

exports.register = function (req, res) {
  //   console.log(req.body);
  let user = new User(req.body);
  user.register();
  //   res.send("Thanks for trying to register");
  if (user.errors.length) {
    res.send(user.errors);
  } else {
    res.send("Congrats, No Errors");
  }
};
