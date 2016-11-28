'use strict';

/**
 * Module dependencies
 */

const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const projects = require('./routes/Projects');
require('./models/init');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

// end module dependencies

// passport config
passport.use(new BasicStrategy(
  function(username, password, done) {
    console.log('passport....');
    if (username !== 'guest') {
      return done(null, false, {message: 'Incorrect username.'});
    }
    if (password !== 'beta2016') {
      return done(null, false, {message: 'Incorrect password.'});
    }
    return done(null, {user: username});
  }
));

// Express setup
var app = express();
app.use(passport.initialize());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/api/projects', projects);
if (process.env.NODE_ENV === 'production') {
  app.use(passport.authenticate('basic', {session: false}));
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
