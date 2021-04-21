const express = require("express");
const app = express();

const router = require("./router");

app.use(express.static("public"));
app.set("views", "views");

// First argument is "views". It is an express option.
// Second argument is folder name "views"
app.set("view engine", "ejs");

app.use("/", router);

app.listen(3000);
