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
    .then(function (newId) {
      req.flash("success", "New post succesfully created")
      req.session.save(()=> res.redirect(`/post/${newId}`))
    })
    .catch(function (errors) {
      errors.forEach(error => req.flash("errors", error))
      req.session.save(()=> res.redirect("/create-post"))
    });
};

exports.viewSingle = async function (req, res) {
  //   res.render("single-post-screen");
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
   
    res.render("single-post-screen", { post: post });
    // We get the document with matching _id and pass that document named as 'post' as 
    // value into "post" property in above unnamed object for use inside EJS template
  } catch {
    res.render("404");
  }
};

// exports.viewEditScreen = async function(req,res) {
//  try {
//   let post = await Post.findSingleById(req.params.id)
//   if(post.authorId == req.visitorId) {
//     res.render("edit-post", {post: post})

//   } else {
//     req.flash("errors", "You do not have permission to perform that action.")
//     req.session.save(()=> res.redirect('/'))
//   }
//  } catch {
//   res.render('404')
//  }
// }

exports.viewEditScreen = async function(req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)
    if (post.isVisitorOwner) {
      res.render("edit-post", {post: post})
    } else {
      req.flash("errors", "You do not have permission to perform that action.")
      req.session.save(() => res.redirect("/"))
    }
  } catch {
    res.render("404")
  }
}

exports.edit = function(req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);

  post.update().then(function(status) {
    // The post was successfully updated in the database
    // or user did have permission but there were validation errors
    if(status == "success") {
      // post was updated in db
      req.flash("success", "Post successfully updated")
      req.session.save(function(){
        res.redirect(`/post/${req.params.id}/edit`)
      })
    } else {
      post.errors.forEach(function(error){
        req.flash("errors", error);
      })
      req.session.save(function(){
        res.redirect(`/post/${req.params.id}/edit`)
      })
    }
    
  }).catch(function() {
    // a post with the requested id doesn't exist 
    // or if the current visitor is not the owner of the requested post.

    req.flash("errors", "You do not have permission to perform that action")
    req.session.save(function(){
      res.redirect('/')
    })
  })

}


exports.delete = function(req, res) {
  Post.delete(req.params.id, req.visitorId).then(() => {
    req.flash("success", "post successfully deleted")
    req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))
  }).catch(() => {
    req.flash("errors", "You do not have permission to perform that action")
    req.session.save(() => res.redirect('/'))
  })
}


exports.search = function (req, res) {
  Post.search(req.body.searchTerm).then(posts=> {
    res.json(posts)
  }).catch(()=> {
    res.json([])
  })
  
}