var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var nocache=require('nocache')
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var app = express();
const dotenv=require('dotenv').config()
var db=require('./Config/connection')
var session=require('express-session')
// view engine setup


app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');
app.use(nocache())
const errorHandler=require("./middleware/errorhandler")
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(session({secret:"key",resave:false,saveUninitialized:false,cookie: {

},

}))
db.connect()

app.use('/admin', adminRouter)
app.use('/', usersRouter);
app.use(errorHandler);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
 
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
  