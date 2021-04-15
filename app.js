//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs')
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption'); //second level encryption library
const md5 = require('md5');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true})

const userSchema = new mongoose.Schema({
  username: String,
  userPassword: String
})

//create a secret key
//const secret = process.env.SECRET;
//plugin the secret key in the schema for encryption
//userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["userPassword"]});

const User = new mongoose.model('user', userSchema);

app.get('/', function(req, res){
  res.render('home')
})

app.get('/register', function(req, res){
  res.render('register')
})

app.post('/register', function(req, res){
  let email = req.body.username;
  let password = req.body.password;

  bcrypt.hash(password, saltRounds, function(err, hash){
    let user = new User({
      username: email,
      userPassword: hash
    })

    user.save(function(err){
      console.log(err)
      if(!err){
        res.render('secrets')
      }
    });
  });
})

app.get('/login', function(req, res){
  res.render('login')
})

app.post('/login', function(req, res){
  let email = req.body.username
  let password = req.body.password

  User.findOne({username: email}, function(err, user){
    if(!err){
          bcrypt.compare(password, user.userPassword, function(err, result){
            if(result === true){
                res.render('secrets')
            }
          });
    }
  })
})

app.listen(3000, function(err){
  if(!err)
    console.log('Server is listening');
  else
    console.log(err);

})
