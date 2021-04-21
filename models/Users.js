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

User.prototype.register = function () {
  //Step 1: Validate User Data
  this.cleanUp();
  this.validate();

  //Step 2. ONLY if there are no
  // validation errors, save the
  // data into a DB.
};

module.exports = User;
