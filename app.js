const express = require("express");
const app = express();

const router = require("./router");

app.use(express.urlencoded({ extended: false }));
// It tells Express to add user submitted form data
// into request (req) object.
// We can access that data using req.body
app.use(express.json());
// This is for sending JSON data b/w files
// inside the project

// Above 2 lines of code will help Express to
// read both form submitted data and general
// data in the form of JSON.

app.use(express.static("public"));
app.set("views", "views");
// First argument is "views". It is an express option.
// Second argument is folder name "views"
app.set("view engine", "ejs");

app.use("/", router);

app.listen(3000);
