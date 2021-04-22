const usersCollection = require("../db").collection("users");
const validator = require("validator");

let User = function (data) {
  this.data = data;
  this.errors = [];
};

User.prototype.cleanUp = function () {
  if (typeof this.data.username != "string") {
    this.data.username = "";
  }
  if (typeof this.data.email != "string") {
    this.data.email = "";
  }
  if (typeof this.data.password != "string") {
    this.data.password = "";
  }

  // get rid of any bogus properties
  // if they are sent by user

  this.data = {
    username: this.data.username.trim().toLowerCase(),
    // trim() will remove whitespaces in strings
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

User.prototype.validate = function () {
  if (this.data.username == "") {
    this.errors.push("You must provide a username");
  }
  if (
    this.data.username != "" &&
    !validator.isAlphanumeric(this.data.username)
  ) {
    this.errors.push("Username can only contain letters and numbers");
  }
  if (!validator.isEmail(this.data.email)) {
    this.errors.push("You must provide a email address");
  }
  if (this.data.password == "") {
    this.errors.push("You must provide a password");
  }
  if (this.data.password.length > 0 && this.data.password.length < 12) {
    this.errors.push("Your password must be atleast 12 characters");
  }
  if (this.data.password.length > 100) {
    this.errors.push("Password cannot exceed 100 characters");
  }
  if (this.data.username.length > 0 && this.data.username.length < 3) {
    this.errors.push("Your Username must be atleast 3 characters");
  }
  if (this.data.username.length > 30) {
    this.errors.push("Username cannot exceed 30 characters");
  }
};

// the callback parameter below represents the
// anon function with parameter 'result' that is passed
// into user.login() function inside the userController.js

User.prototype.login = function () {
  // Here, we use arrow fn to not change 'this'
  return new Promise((resolve, reject) => {
    // You can perform Async operations here.

    // When those Async actions are done,
    // You can either resolve... or reject...
    this.cleanUp();
    // Search if username exists.. first.
    // If mongoDB has it.. it will pass that document (which is an object)
    // as parameter into attemptedUser of the callback function
    usersCollection
      .findOne({ username: this.data.username })
      .then((attemptedUser) => {
        if (attemptedUser && attemptedUser.password === this.data.password) {
          resolve("Congrats!");
        } else {
          reject("invalid username / password");
        }
      })
      .catch(function () {
        reject("Please try again later");
        // this will show up for any unforeseen error
      });
  });
};

User.prototype.register = function () {
  //Step 1: Validate User Data
  this.cleanUp();
  this.validate();

  //Step 2. ONLY if there are no
  // validation errors, save the
  // data into a DB.

  if (!this.errors.length) {
    usersCollection.insertOne(this.data);
  }
};

module.exports = User;
