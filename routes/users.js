const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const config = require('../config/config');
const {User} = require('../models/User');
const {Quiz} = require('../models/Quiz');


router.post('/auth', (req, res) => {

  let email = req.body.email;
  let password = req.body.password;
  let key = req.headers['x-app-key'];

  let secretAppKey = config.appkey;

  if (key !== secretAppKey) {
    res.status(403).json({data: null, appkey: {notMatch: "App-Key doesn't match"}});
  } else if (!email) {
    res.status(400).json({data: null, email: {isEmpty: "Campo obbligatorio"}});
  } else if (!password) {
    res.status(400).json({data: null, password: {isEmpty: "Campo obbligatorio"}});
  }  else if (!email && !password) {
    res.status(400).json({data: null, email: {isEmpty: "Campo obbligatorio"}, password: {isEmpty: "Campo obbligatorio"}});
  } else {
    User.getUserByEmail(email, (err, user) => {
      if (err) {return next(err);}
      if (!user) {
        res.status(400).json({data: null, message: 'E-mail: '+ email +' does not exist'});
      } else {
        User.comparePassword(password, user.password, (err, isMatch) => {
          if (err) {return next(err);}
          if (isMatch) {
            user.token = jwt.sign(user._id, config.secret, {expiresIn: 604800});
            res.status(200).json({ data: user});
          } else {
            return res.status(400).json({data: null, password: {notMatch :'Wrong password'}});
          }
        });
      }
    });
  }
});

router.get('/check-token', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (req.user) {
    res.json({success : true});
  }
});

router.get('/:listid/chat',  /*passport.authenticate('jwt', {session: false}),*/ (req, res) => {
  req.createRoom(req.params.listid, 'bomj');
  res.status(200).send();
});

router.get('/:listid/quiz', passport.authenticate('jwt', {session: false}), (req, res) => {
  const quizid = req.params.listid;
  const secretAppKey = config.appkey;

  let key = req.headers['x-app-key'];

  if (key !== secretAppKey) {
    res.status(403).json({data: null, appkey: {notMatch: "Not enough permissions"}});
  } else {
    Quiz.findById(quizid).then((quiz) => {
      if (!quiz) {
        res.status(400).json({data: null, message: `No quiz with id:${quizid} found`});
      }  else {
        req.status(200).json({data: quiz});
      }
    }).catch((e) => {
      res.status(400).json({data: null, message: 'Something went wrong', error : e});
    });
  }
});

router.post('/:listid/quiz', passport.authenticate('jwt', {session: false}), (req, res) => {
  const quizid = req.params.listid;
  const secretAppKey = config.appkey;

  let key = req.headers['x-app-key'];

  if (key !== secretAppKey) {
    res.status(403).json({data: null, appkey: {notMatch: "Not enough permissions"}});
  } else {
    Quiz.findById(quizid).then((quiz) => {
      if (!quiz) {
        res.status(400).json({data: null, message: `No quiz with id:${quizid} found`});
      }  else {
        req.status(200).json({data: quiz});
      }
    }).catch((e) => {
      res.status(400).json({data: null, message: 'Something went wrong', error : e});
    });
  }
});




module.exports = router;
