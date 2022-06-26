const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
const { query } = require('express');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


function initialize(passport) {
  const authenticateUser = (email, password, done) => {
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("FaceAttendance");
        var query = { email: email };     
        dbo.collection("users").find(query).toArray(async function(err, result) {
            if (err) throw err;
            query = result[0];
            db.close();
        
            const user = query;
            console.log(user);
            if (query?.username == null) {
              return done(null, false, { message: 'No user with that email' })
            }

            try {
            if (await bcrypt.compare(password, query.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Password incorrect' })
            }
            } catch (e) {
            return done(e)
            }
        });
    });
  }

  passport.use(new LocalStrategy({
    usernameField: 'userEmail', passwordField: 'password' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((user, done) => {
    return done(null, user)
  })
}

module.exports = initialize