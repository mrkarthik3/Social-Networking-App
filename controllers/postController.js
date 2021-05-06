const Post = require("../models/Post");

exports.viewCreateScreen = function (req, res) {
  // res.render("create-post", {username: req.session.user.username, avatar: req.session.user.avatar})
  res.render("create-post");

};

exports.create = function (req, res) {
  let post = new Post(req.body, req.session.user._id);
  // This req.body will contain the form data submitted by the user
  // We will ensure that create returns a promise so that we can use .then and .catch.
  post
    .create()
    .then(function () {
      res.send("New post created.");
    })
    .catch(function (errors) {
      res.send(errors);
    });
};

exports.viewSingle = async function (req, res) {
  //   res.render("single-post-screen");
  try {
    let post = await Post.findSingleById(req.params.id);
    res.render("single-post-screen", { post: post });
    // We get the document with matching _id and pass that document named as 'post' as 
    // value into "post" property in above unnamed object for use inside EJS template
  } catch {
    res.render("404");
  }
};
