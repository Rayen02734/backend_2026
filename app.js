// importation of modules

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const http = require('http'); // importation biblio http

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/Admin.routes');
var teacherRouter = require('./routes/Teacher.routes');
var studentRouter = require('./routes/Student.routes');
var educationRouter = require('./routes/Education.routes');
var paymentRouter = require('./routes/Payment.routes');
require('dotenv').config();

const { connectToMongoDB } = require('./config/mogo.connection');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/teachers', teacherRouter);
app.use('/students', studentRouter);
app.use('/educations', educationRouter);
app.use('/payments', paymentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
   connectToMongoDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});
