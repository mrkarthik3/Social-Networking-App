const express = require("express");
const router = express.Router();
// above line is mini express app

router.get("/", function (req, res) {
  res.render("home-guest");
  // Renders the EJS template with name 'home-guest'
});

router.get("/about", function (req, res) {
  res.send("You visited about page");
});

module.exports = router;
