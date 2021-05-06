const express = require("express");
const router = express.Router();
// above line is mini express app

const userController = require("./controllers/userController");
const postController = require("./controllers/postController");

// Import controller file

router.get("/", userController.home);
// routing the request --> '/' to 'home' function inside
// the userController.js file.

// User related routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Profile related routes
router.get("/profile/:username", userController.ifUserExists, userController.profilePostsScreen)

// Post related routes
router.get(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.viewCreateScreen
);
router.post(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.create
);

router.get("/post/:id", postController.viewSingle);
module.exports = router;
