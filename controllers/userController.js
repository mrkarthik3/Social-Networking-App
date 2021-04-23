const User = require("../models/User");

// Here 2 dots are required.. because Users.js is
// present inside 'models' folder that is on equal level of
// this folder 'controllers'

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

      // Here we are adding a property called 'user'.
      // Its name can be anything.
      // It will have the following data.
      req.session.user = { favColor: "blue", username: user.data.username };
      // After logging in...
      // The request object will have session object that is unique
      // for every browser visitor
      // Above operation is an async operation because of
      // trying to update info in Db.

      // Even though the session package will automatically update
      // the session data for us, we can manually tell it to save
      // using the .save() function
      // res.send(result);

      req.session.save(function () {
        res.redirect("/");
      });
      // redirect will occur only when the save() execution is complete.
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

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
  // Whatever sessionid is present in the cookie received
  // when a request is made...This will find that sessionid
  // and delete that from the server.
  // res.send("You are now logged out.");
  // Above operation takes uncertain time.
  // So for redirecting to homepage after session
  // is destroyed... we need to use traditional callback
  // We are not using promises here because it is not supported
  // by this destroy() function. It doesn't return Promise.
};

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

exports.home = function (req, res) {
  // The session object of request object will have user property
  // only when a successful login occurs. Otherwise it will be empty
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username });
    // res.send("Welcome to our actual application");
  } else {
    res.render("home-guest");
    // Renders the EJS template with name 'home-guest'
  }
};
