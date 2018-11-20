require("dotenv").config();
import "babel-polyfill";
const path = require("path");
const express = require("express");

import app from "server/src/app";
// after api routes so that doesn't mess with them?
if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("/*", function(req, res) {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}
app.listen(process.env.PORT, () =>
  console.log(`Listening on ${process.env.PORT}`)
);
