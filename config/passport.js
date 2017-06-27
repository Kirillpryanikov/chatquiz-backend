const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const config = require('../config/config');
const {User} = require('../models/User');

module.exports = function(passport) {
  let opts = {};

  opts.jwtFromRequest = ExtractJwt.fromHeader('x-auth-token');
  opts.secretOrKey = config.secret;

  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {

    User.getUserByID(jwt_payload.id, (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(false, user);
      } else {
        return done(null, false);
      }
    });
  }));
};
