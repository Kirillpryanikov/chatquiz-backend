const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const UserSchema = mongoose.Schema({
    email : String,
    password : String
});

UserSchema.statics.getUserByID = function (id, callback) {
  User.findById(id, callback);
};

UserSchema.statics.getUserByEmail = function (email, callback) {
  let query = {email : email};
  User.findOne(query, callback);
};

UserSchema.statics.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) {
      throw err;
    }
    callback(null, isMatch);
  });
};

UserSchema.pre('save', function(next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});


const User = mongoose.model('User', UserSchema);
module.exports = {User};
