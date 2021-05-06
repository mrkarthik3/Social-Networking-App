const User = require("../models/User");
const Post = require("../models/Post");


// Here 2 dots are required.. because Users.js is
// present inside 'models' folder that is on equal level of
// this folder 'controllers'

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    // If there is session data. It means... a user is logged in.
    // Then we tell express to run next function in the router...
    next();
  } else {
    req.flash("errors", "You must be logged in to perform that option");
    req.session.save(function () {
      res.redirect("/");
    });
  }
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

      // Here we are adding a property called 'user' ONLY if login succeeds
      // Its name can be anything.
      // It will have the following data.
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        _id: user.data._id,
      };
      // After logging in...
      // The request object will have session object that is unique
      // for every browser visitor
      // Above operation is an async operation because of
      // trying to update info in Db.
      // Here, the session package will update the session object in DB automatically

      // Even though the session package will automatically update
      // the session data for us, we can manually tell it to save
      // using the .save() function
      // .save() will save the data to Databse
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
      // res.send(e);
      req.flash("errors", e);
      // "errors" is an array
      // this will add a flash property to
      // req.session. So, it becomes req.session.flash.errors
      // This flash will have another property 'errors' like above
      // That errors property of flash will have value from 'e'.

      // Note that this flash is a DB operation.
      // Session package will auto-store to DB
      // whenever we call res.send or res.redirect but the time
      // it takes is not known.

      // Below will cause to save the session data in database
      // This will ensure saving data to DB. ONLY Then..
      // redirect will occur
      // This will ensure that the flash object is stored in the DB.

      req.session.save(function () {
        res.redirect("/");
      });
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

  user
    .register()
    .then(() => {
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id,
      };
      // Here we are setting session data in order to redirect them to logged in page
      // instead of sending them to a dummy page saying "Registration Successful."
      // Since there is session data, a refresh will cause them to go into their logged in dashboard.

      req.session.save(function () {
        res.redirect("/");
      });
      // Here we are saving this session data and then doing a redirect to homepage.
      // This will cause the
    })
    .catch((regErrors) => {
      regErrors.forEach(function (error) {
        req.flash("regErrors", error);
      });
      req.session.save(function () {
        res.redirect("/");
      });
    });
  //   res.send("Thanks for trying to register");
};

exports.home = function (req, res) {
  // The session object of request object will have user property
  // only when a successful login occurs. Otherwise it will be empty
  if (req.session.user) {
    res.render("home-dashboard");
    // res.send("Welcome to our actual application");
  } else {
    res.render("home-guest", {
      errors: req.flash("errors"),
      regErrors: req.flash("regErrors"),
    });
    // Renders the EJS template with name 'home-guest'
  }
};

exports.ifUserExists = function(req, res, next) {
  User.findByUsername(req.params.username).then(function(userDocument) {
    req.profileUser = userDocument;
    next();
  }).catch(function() {
    res.render("404")
  })
}

exports.profilePostsScreen = function(req,res) {

  // Ask our post model for posts by a certain author id
  Post.findByAuthorId(req.profileUser._id).then(function(posts) {
    res.render("profile", {
      posts: posts,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar
    })
  }).catch(function(){
    res.render('404')
  })


}