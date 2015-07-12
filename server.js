var express = require('express');
var app = express();

var path = require('path');

var config = require('./config.json');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

// Server configuration
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, './views'));

//use is middleware

app.use('public', express.static(path.join(__dirname,'public')));

app.use(session({
  store: new RedisStore(),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 120 * 1000 // 10 seconds
  }
}));

app.use(function (req, res, next) {
  var session = req.session;
  if (session.views) {
    session.views++
  } else {
    session.views = 1;
  }

  console.log('viewed', session.views, 'times!')
  next();
});

app.get('/', function(req,res) {
  res.render('index', { title: 'Hey', message: 'NOOOOOOOO'});
});

var server = app.listen(3000, function () {
  console.log('Hello err-body!');
});