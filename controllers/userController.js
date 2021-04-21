const User = require("../models/Users");

// Here 2 dots are required.. because Users.js is
// present inside 'models' folder that is on equal level of
// this folder 'controllers'

exports.home = function (req, res) {
  res.render("home-guest");
  // Renders the EJS template with name 'home-guest'
};

exports.login = function () {};

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
