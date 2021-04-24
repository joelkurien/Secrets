//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs')
const mongoose = require('mongoose');
const md5 = require('md5');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(express.static('public'));

//initializing sessions and cookies
app.use(session({
  secret: "helloworld",
  resave: false,
  saveUninitialized: false  //is false because initally it is not modified (registeration)
}));                        //is true when modified (login)

app.use(passport.initialize()); //initialize passport
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: String,
  userPassword: String
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('user', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res){
  res.render('home')
})

app.get("/secrets", function(req, res){
  console.log("Hello")
    if(req.isAuthenticated()){
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
});

app.get('/register', function(req, res){
  res.render('register')
})

app.post('/register', function(req, res){
  let email = req.body.username;
  let password = req.body.password;

  User.register({username: email}, password, function(err, user){
    if(err){
      console.log(err);
      user.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  });
})

app.get('/login', function(req, res){
  res.render('login')
})

app.post('/login', function(req, res){
  let email = req.body.username
  let password = req.body.password

  const user = new User({
    username: email,
    userPassword: password
  });

  req.login(user, function(err){
    if(!err){
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    } else {
      console.log(err);
      res.redirect("/login")
    }
  })
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/")
})
app.listen(3000, function(err){
  if(!err)
    console.log('Server is listening');
  else
    console.log(err);

})
