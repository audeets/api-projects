"use strict";

/**
 * Module dependencies
 */

const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const projects = require("./routes/projects");

// end module dependencies

// Express setup
var app = express();
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_BASE_URL);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 30,
      httpOnly: false,
    },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api/projects", projects);

module.exports = app;
