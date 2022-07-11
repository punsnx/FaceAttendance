const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
const { query } = require('express');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.CON_DB;


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
              try {
                insertLastLogin(user, Date.now().toString());
              } catch {
                console.log("Cannot insert LastLogin");
              }
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
function insertLastLogin(user, timestamp) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    var userlogin = { studentID : user.studentID, name: user.name, timestamp: timestamp};
    dbo.collection("LastLogin").insertOne(userlogin, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted LastLogin");
      db.close();
    });
  });
}

module.exports = initialize;