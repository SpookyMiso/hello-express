var config = require('./config.json');

var express = require('express');
var app = express();

var path = require('path');
var bodyParser = require('body-parser');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


// Server configuration
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, './views'));


//use is middleware
app.use(express.static(path.join(__dirname,'public')));

app.use(session({
  store: new RedisStore(),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 2 * 1000 // 10 seconds
  }
}));

app.use(passport.initialize());
app.use(passport.session());


//passport uses middleware!!!
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log(username, password);
    var admin = config.admin;

    if(!admin){
      return done(new Error ('No admin configured!'));
    }

    if (username !== admin.username) {
      return done(null, false, {message: 'Incorrect username'});
    }

    if (password !== admin.password) {
        return done(null, false, { message: 'Incorrect password' });
    }

    return done(null, admin);

    })

);

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

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req,res) {
  res.render('index', { title: 'Hey', name: req.session.name});
  console.log();
});

app.post('/sign-in', function(req, res) {
  var session = req.session;
  console.log("Hello", req.body);
  if (req.body.text_box) {
    session.name = req.body.text_box;
  }
  res.redirect('/');
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/secret',
                                   failureRedirect: '/',
                                   session: false })
);

app.get('/secret', function(req, res, next) {
  res.send('SECRET!');
});

var server = app.listen(3000, function () {
  console.log('Hello err-body!');
});