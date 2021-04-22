const express = require("express");
const router = express.Router();
// above line is mini express app

const userController = require("./controllers/userController");
// Import controller file

router.get("/", userController.home);
// routing the request --> '/' to 'home' function inside
// the userController.js file.
router.post("/register", userController.register);

router.post("/login", userController.login);

module.exports = router;
