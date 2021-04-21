const User = require("../models/Users");

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
