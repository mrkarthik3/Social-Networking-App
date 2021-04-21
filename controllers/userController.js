exports.home = function (req, res) {
  res.render("home-guest");
  // Renders the EJS template with name 'home-guest'
};

exports.login = function () {};

exports.logout = function () {};

exports.register = function (req, res) {
  res.send("Thanks for trying to register");
};
