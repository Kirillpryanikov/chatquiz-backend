const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  name : String,

  questions : [{
    _id: false,
    id: Number,
    title : String,
    answers : [{
      _id: false,
      id : Number,
      text: String
    }],
    multiselect : Boolean
  }],

  replies :[{
    _id: false,
    _creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    answers: [{
      _id: false,
      questionId : Number,
      answersIds: [Number]
    }]

  }]
});

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = {Quiz};
