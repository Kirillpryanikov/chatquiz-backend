const {User} = require('./models/User');
const {Quiz} = require('./models/Quiz');
const mongoose = require('mongoose');
const config = require('./config/config');

mongoose.Promise = global.Promise;
mongoose.connect(config.database);
mongoose.connection.on('connected', () => {
  // (new User({
  //   email: 'test@test.test',
  //   password: 'test'
  // })).save().then(user => {
  //   console.log('Test user was saved email : test@test.test & password : test');
  // }).catch(e => {
  //   console.log(e);
  // });

  (new Quiz({
    name : 'Test',

    questions : [{
    
      id: 1,
      title : 'How are you?',
      answers : [{
        id: 1,
        text: 'Answer 1'
      },{
        id: 2,
        text: 'Answer 2'
      },{
        id: 3,
        text: 'Answer 3'
      }],
      multiselect : false
    }, {
      title : 'Che kogo?',
      id: 2,
      answers : [{
        id: 1,
        text: 'Answer 1'
      },{
        id: 2,
        text: 'Answer 2'
      },{
        id: 3,
        text: 'Answer 3'
      }],
      multiselect : false
    },{
      id: 3,
      title : 'Kto takoy Chingi Khan',
      answers : [{
        id: 1,
        text: 'Answer 1'
      },{
        id: 2,
        text: 'Answer 2'
      },{
        id: 3,
        text: 'Answer 3'
      }],
      multiselect : true
    },{
      id: 4,
      title : 'Yanyk vernetsya?',
      answers : [{
        id: 1,
        text: 'Answer 1'
      },{
        id: 2,
        text: 'Answer 2'
      },{
        id: 3,
        text: 'Answer 3'
      }],
      multiselect : false
    },{
      id: 5,
      title : 'Ya vchera byl doma, a ona takay tipa net davay ne budem',
      answers : [{
        id: 1,
        text: 'Answer 1'
      },{
        id: 2,
        text: 'Answer 2'
      },{
        id: 3,
        text: 'Answer 3'
      }],
      multiselect : false
    }]
  })).save().then(quiz => {
    console.log('Test quiz with :listid', quiz._id);
  }).catch((err) => {console.log(e);});
});
