const express = require("express");
const app = express();

app.use(express.static("public"));
app.set("views", "views");
// First argument is "views". It is an express option.
// Second argument is folder name "views"
app.set("view engine", "ejs");
app.get("/", function (req, res) {
  res.render("home-guest");
  // Renders the EJS template with name 'home-guest'
});

app.listen(3000);
