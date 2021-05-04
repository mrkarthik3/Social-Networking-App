const bcrypt = require("bcryptjs");
const usersCollection = require("../db").db().collection("users");
const validator = require("validator");
const md5 = require("md5");

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
  return new Promise(async (resolve, reject) => {
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
    if (this.data.password.length > 50) {
      this.errors.push("Password cannot exceed 50  characters");
    }
    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push("Your Username must be atleast 3 characters");
    }
    if (this.data.username.length > 30) {
      this.errors.push("Username cannot exceed 30 characters");
    }

    // Only if username is valid  then check to see if it is already taken

    // the findOne method of MongoDB returns a Promise.
    // This promise will return an object (which evaluates to 'true') if a matching document is found.
    // Else.. it will return 'null' (which evaluates to 'false')

    // Here we check to see if the username typed by the user exists already in the database.
    // if it exists, an object will be returned into usernameExists, otherwise null will be returned.
    // We changed this function into 'async' in order to use 'await'
    if (
      this.data.username.length > 2 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username)
    ) {
      let usernameExists = await usersCollection.findOne({
        username: this.data.username,
      });
      if (usernameExists) {
        this.errors.push("That username is already taken");
      }
    }
    // Following code.. is for finding out if the current email already exists in the database
    if (
      this.data.email.length > 2 &&
      this.data.email.length < 31 &&
      validator.isEmail(this.data.email)
    ) {
      let emailExists = await usersCollection.findOne({
        email: this.data.email,
      });
      if (emailExists) {
        this.errors.push("That email is already used");
      }
    }
    resolve();
    // resolve runs when all operations above it are completed
  });
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
        // if (attemptedUser && attemptedUser.password === this.data.password) {
        if (
          attemptedUser &&
          bcrypt.compareSync(this.data.password, attemptedUser.password)
        ) {

          this.data = attemptedUser;

          // So once a user logs in all of their matching data from the database will be available on the object, and then we're using that to place the user's id into session data.

          // You don't need to do this while 'registering'
          // Because, there is enough setup inside the regiser function of userController 
          // which adds the user inputted data immediately into session data.

          console.log(this.data);
          // This is to ensure getAvatar() has access to email of the loggedin user.
          this.getAvatar();
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
  return new Promise(async (resolve, reject) => {
    //Step 1: Validate User Data
    this.cleanUp();
    await this.validate();

    //Step 2. ONLY if there are no
    // validation errors, save the
    // data into a DB.

    if (!this.errors.length) {
      //hash password before adding the data to DB
      //To hash anything... first we need to generate 'salt'
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);

      await usersCollection.insertOne(this.data);
      this.getAvatar();
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

User.prototype.getAvatar = function () {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
};

module.exports = User;
