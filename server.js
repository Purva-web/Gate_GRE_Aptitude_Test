const express = require("express");
const app = express();
const path = require("path");

app.use(express.static("public")); // if your frontend files are in /public

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;
