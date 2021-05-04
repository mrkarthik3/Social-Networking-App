const postsCollection = require("../db").db().collection("posts");
const ObjectID = require("mongodb").ObjectID;
// Here we are loading ONLY... ObjectID part of mongodb package.

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
    createDate: new Date(),
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

Post.findSingleById = function (id) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }
    let post = await postsCollection.findOne({ _id: new ObjectID(id) });
    // IF MongoDB finds a document with matching id, then it will return that document.
    if (post) {
      resolve(post);
      // This promise will resove to the document which has matching _id.
    } else {
      reject();
    }
  });
};

module.exports = Post;
