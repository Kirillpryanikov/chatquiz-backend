const {User} = require('./models/User');
const {Quiz} = require('./models/Quiz');
const mongoose = require('mongoose');
const config = require('./config/config');

mongoose.Promise = global.Promise;
mongoose.connect(config.database);
mongoose.connection.on('connected', () => {
  (new User({
    email: 'test@test.test',
    password: 'test'
  })).save().then(user => {
    console.log('Test user was saved email : test@test.test & password : test');
  }).catch(e => {
    console.log(e);
  });

  (new Quiz({
    name : 'Test',

    questions : [{
      title : 'How are you?',
      answers : ['Norm', 'Tak sebe', 'Ty chto chert poputal e?'],
      multiselect : false
    }, {
      title : 'Che kogo?',
      answers : ['takoe', 'normalno', 'zbs'],
      multiselect : false
    },{
      title : 'Kto takoy Chingi Khan',
      answers : ['Tip', 'Chert', 'Vlastitel mira'],
      multiselect : false
    },{
      title : 'Yanyk vernetsya?',
      answers : ['Net', 'Da', 'Salo uronili'],
      multiselect : false
    },{
      title : 'Ya vchera byl doma, a ona takay tipa net davay ne budem',
      answers : ['Podstatva', 'Ty sho ty tip', 'nu esli tak podumat to sam vinovat'],
      multiselect : false
    }]
  })).save().then(quiz => {
    console.log('Test quiz with :listid', quiz._id);
  }).catch((err) => {console.log(e);});
});
