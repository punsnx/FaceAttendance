if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
} // if it's development >> require development tendency of dotenv
//load in all of our different environment variables and set them inside process of dotenv
const port = process.env.port;
const express = require("express");
const app = express();
const debug = require("debug");
const chalk = require("chalk");
const mongoose = require("mongoose");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const formidable = require("formidable");
const fs = require("fs");
const authProcess = require("./authentication.js");
const User = require("./models/user.js");
const httpStorage = require("./httpStorage.js");
const initializePassport = require("./passport-config.js");

initializePassport(
  passport
  //  email => users.find(user => user.email === email),
  //  id => users.find(user => user.id === id)
)
var MongoClient = require("mongodb").MongoClient;
var url = process.env.CON_DB;
//"mongodb+srv://skdev:skdev123456789@skmongocluster.skdn9.mongodb.net/?retryWrites=true&w=majority";  
// "mongodb://localhost:27017";

//app.use
app.use(morgan("combined"));
app.use("/CSS", express.static(__dirname + "/src/views/CSS"));
app.use("/JS", express.static(__dirname + "/src/views/JavaScripts"));
app.use("/IMG", express.static(__dirname + "/src/views/IMG"));

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, //if notthing has changed >> dont't resave
  saveUninitialized: false // don't save empty values in the session
}));
app.use(passport.initialize())
app.use(passport.session())

//app.set
app.set("views", "./src/views");
app.set("view engine", "ejs");


//TEST Firebase
app.get("/storage/user_profile/:path", (req, res) => {
  httpStorage(req, res);
});
//INDEX
app.get("/", (req, res) => {
  if (req?.user) {
    console.log(req.user.name);
    res.render("pages/index", { title: "home", name: "welcome " + req.user.username });
  } else {
    res.render("pages/index", { title: "home", name: "not login" });
  }

});
app.get("/vuejs", (req,res) => {
  res.render("pages/vuejs");
});
app.post("/showusers", (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    dbo.collection("users").find({}).toArray(function (err, result) {
      if (err) throw err;
      //chalk.magenta(console.log(result));
      res.render("pages/showusers", { results: result });

      db.close();
    });
  });
});
//Login
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("pages/login", { title: "login" });
});
app.post("/login", passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))
//Auth
app.get("/auth", checkNotAuthenticated, (req, res) => {
  res.render("pages/auth", { title: "authentication", alertauth: [] });
});
app.post("/auth", async (req, res) => {
  if (req.body.authPassword == req.body.authCFPassword) {
    try {
      hashedPassword = await bcrypt.hash(req.body.authPassword, 10);
      authProcess(req, res, hashedPassword);//Insert DB

    } catch {
      res.render("pages/auth", {
        title: "authentication",
        alertauth: "hash / db error"
      });
    }

  } else {
    res.render("pages/auth", {
      title: "authentication",
      alertauth: "Password not same"
    });
  }


});
//Profile
app.get("/profile", checkAuthenticated, (req, res) => {
  res.render("pages/profile", {
    title: "Profile", name: req.user,
    profileFile: req.user.profileFile
  });
})
app.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get("/test", async (req, res) => {
  const user = await User.findOne({});
  res.send(user.username)
})


app.post('/process/uploadprofile', checkAuthenticated, (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.send(err);
    } else {
      //res.json({ files });
      var oldpath = files.profileIMGuploading.filepath;
      var newpath = __dirname + "/src/views/IMG/user_profile/" + req.user.studentID + "_" + req.user.username + ".jpeg";
      //var newpath = process.env.HOME + "/Desktop/SKDEV/GitHub/FaceAttendance/src/views/IMG/user_profile/" + req.user.studentID + "_" + req.user.username + ".jpeg";
      console.log(newpath);
      if (fs.existsSync(newpath)) {
        try {
          fs.unlinkSync(newpath)
          //file removed
        } catch (err) {
          console.error(err)
        }
      }
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        insertProfileToDB(req);
        res.redirect("/profile")
      });
    }
  });

});

app.listen(port, function () {
  console.log(
    "Express server listening on port %d  http://localhost:%d/",
    this.address().port,
    this.address().port
  );

});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect("/login");
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/")
  }
  next();
}
function insertProfileToDB(req) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    var myquery = { id: req.user.id };
    var profileName = req.user.studentID + "_" + req.user.username + ".jpeg";
    var newvalues = { $set: { profileFile: profileName, httpProfilePath: "/storage/user_profile/" + profileName } };
    dbo.collection("users").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
}
function sortLastLogin(data) {
  for (i in data) {
    console.log(typeof data);
  }
  return "SORT DATA LAST LOGIN"
}