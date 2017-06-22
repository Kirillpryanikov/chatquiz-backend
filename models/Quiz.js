const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  name : String,

  questions : [{
    title : String,
    answers : Array,
    multiselect : Boolean
  }],

  replies :[{

    _creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    answers: [{
      questionId : Number,
      answersIds: [Number]
    }]

  }]
});

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = {Quiz};
