const postsCollection = require("../db").db().collection("posts");
const ObjectID = require("mongodb").ObjectID;
// Here we are loading ONLY... ObjectID part of mongodb package.
const User = require("./User")

let Post = function (data, userid) {
  this.data = data; // data is the form data submitted.
  this.errors = []; // any validation errors can be pushed into this
  this.userid = userid;
};

Post.prototype.cleanUp = function () {  
  if (typeof this.data.title != "string") {
    this.data.title = "";
  }
  if (typeof this.data.body != "string") {
    this.data.body = "";
  }

  // get rid of any bogus properties.

  // trim will remove white spaces at the beginning and end of values
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdDate: new Date(),
    author: ObjectID(this.userid),
  };

  // Due to this, if the user sends any unwanted properties
  // and try to store them in DB, our over-riding like this..
  // will ensure that those unwanted properties are not stored in
  // the database
};

Post.prototype.validate = function () {
  if (this.data.title == "") {
    this.errors.push("You must provide a title");
  }
  if (this.data.body == "") {
    this.errors.push("You must provide content");
  }
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();

    if (!this.errors.length) {
      // save post into database if no errors
      postsCollection
        .insertOne(this.data)
        .then(() => {
          resolve();
        })
        .catch(() => {
          this.errors.push("Please try again later");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

// Post.reusablePostQuery = function () {
//   return new Promise(async function (resolve, reject) {

//     let posts = await postsCollection.aggregate([
//       {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
//       {$project: {
//         title: 1,
//         body: 1,
//         createdDate: 1,
//         author: {$arrayElemAt: ["$authorDocument", 0]}
//       }}
//     ]).toArray()


//     posts = posts.map(function(post){
//       post.author = {
//         username: post.author.username,
//         avatar: new User(post.author, true).avatar
//       }
//       return post
//     })

//     resolve(posts)
//   });
// };

Post.findSingleById = function (id) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }
    let posts = await postsCollection.aggregate([
      {$match: {_id: new ObjectID(id)}},
      {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
      {$project: {
        title: 1,
        body: 1,
        createdDate: 1,
        author: {$arrayElemAt: ["$authorDocument", 0]}
        // with this... author will not be an array but
        /// a single document representing that user.
      }}
    ]).toArray()

    // cleanup author property in each post object

    posts = posts.map(function(post){
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      }
      return post
    })

    // aggregate lets us run multiple operations
    // it takes an array as argument and 
    // in that array we can do multiple database operations.
    // each operation in that array is represented as an object.

    // Note that you are currently inside postsCollection... but want to get document from usersCollection (users)
    // Therefore, postsCollection is local and usersCollection (users) is foreign
    // The lookup operation searches inside "users" collection based on value of "author" field's value
    // It searches for documents which have "_id" field's property equal to that of "author" field's value
    // Then it places that object(s) inside a property called authorDocument which has array as value.
    if (posts.length) {
      console.log(posts[0])
      // console.log("_______________________________________")
      // console.log(posts)

      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function(authorId) {

}

module.exports = Post;
