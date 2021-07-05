require("dotenv").config();
import "babel-polyfill";
global.fetch = require("node-fetch");

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
  /* eslint-disable-next-line no-console */
  console.log(`Listening on ${process.env.PORT}`)
);
