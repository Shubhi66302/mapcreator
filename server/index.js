require("dotenv").config();
const express = require("express");
const app = express();
// const
app.get("/", (req, res) => res.send("Hello World!"));

app.get("/api/test", (req, res) => res.json("test api response"));

app.listen(process.env.PORT, () =>
  console.log(`Listening on ${process.env.PORT}`)
);
