const postsCollection = require("../db").db().collection("posts");
const ObjectID = require("mongodb").ObjectID;
// Here we are loading ONLY... ObjectID part of mongodb package.
const User = require("./User")
const sanitizeHTML = require("sanitize-html")

let Post = function (data, userid, requestedPostId) {
  this.data = data; // data is the form data submitted.
  this.errors = []; // any validation errors can be pushed into this
  this.userid = userid;
  this.requestedPostId = requestedPostId
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
    // title: this.data.title.trim(),
    // body: this.data.body.trim(),
    body: sanitizeHTML(this.data.body.trim(), {allowedTags: [],allowedAttributes: {}}),
    title: sanitizeHTML(this.data.title.trim(), {allowedTags: [],allowedAttributes: {}}),

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
        .then((info) => {
          resolve(info.ops[0]._id);
          // This promise will resolve with _id property of
          // newly created post.
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

Post.prototype.update = function() {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userid)
      
      if(post.isVisitorOwner){
        // actually update db
        let status = await this.actuallyUpdate()
        resolve(status)
      } else {
        reject()
      }
    }
    catch {
      reject()
    }
  })
}

Post.prototype.actuallyUpdate = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    this.validate()

    if(!this.errors.length){
      await postsCollection.findOneAndUpdate({_id: new ObjectID(this.requestedPostId)},{$set: {title: this.data.title, body: this.data.body}})
      resolve("success");
    } else {
      resolve("failure")
    }

  })
}


Post.reusablePostQuery = function (uniqueOperations, visitorId, finalOperations = []) {
  return new Promise(async function (resolve, reject) {
    let aggOperations = uniqueOperations.concat([
      {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
      {$project: {
        title: 1,
        body: 1,
        createdDate: 1,
        authorId: "$author",
        author: {$arrayElemAt: ["$authorDocument", 0]}
      }}
    ]).concat(finalOperations)

    let posts = await postsCollection.aggregate(aggOperations).toArray()
    // If there are no matches, this will resolve to null

    posts = posts.map(function(post){
      post.isVisitorOwner = post.authorId.equals(visitorId)
      post.authorId = undefined
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      }
      return post
    })

    resolve(posts)
  });
};

Post.findSingleById = function (id,visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof(id) != "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }
    
    let posts = await Post.reusablePostQuery([
      {$match: {_id: new ObjectID(id)}}
    ], visitorId)

    if (posts.length) {
      console.log(posts[0])
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function(authorId) {
  return Post.reusablePostQuery([
    {$match: {author: authorId}},
    {$sort: {createdDate: -1}}
  ])
 
}

Post.delete = function(postIdToDelete, currentUserId) {
  return new Promise(async (resolve,reject) => {
    try{
      let post = await Post.findSingleById(postIdToDelete, currentUserId)
      if(post.isVisitorOwner) {
        // actually delete
        await postsCollection.deleteOne({_id: new ObjectID(postIdToDelete)})
        resolve()
      } else {
        reject()
      }
    }
    catch { 
      reject()
    }
  })
}

Post.search = function(searchTerm) {
  return new Promise(async (resolve, reject) => {
    if(typeof(searchTerm) == "string") {

      let posts = await Post.reusablePostQuery([
        {$match: {$text: {$search: searchTerm}}}
      ], undefined, [{$sort: {score: {$meta: "textScore"}}}])

      // let posts = await Post.reusablePostQuery([
      //   {$match: {$text: {$search: searchTerm}}}
      // ], undefined)
      // NO sort by relevancy score
      resolve(posts)

    } else {
      reject()
    }
  })
}

module.exports = Post;
