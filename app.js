if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
} // if it's development >> require development tendency of dotenv
//load in all of our different environment variables and set them inside process of dotenv
const port = process.env.port;
const express = require("express");
const app = express();
const debug = require("debug");
const chalk = require("chalk");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const passport =  require("passport");
const bcrypt = require("bcrypt");
const authProcess = require("./authentication.js");
const initializePassport = require("./passport-config.js");

initializePassport(
  passport
//  email => users.find(user => user.email === email),
//  id => users.find(user => user.id === id)
)
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017";
//"mongodb+srv://skdev:skdev123456789@skmongocluster.skdn9.mongodb.net/?retryWrites=true&w=majority";  

//app.use
app.use(morgan("combined"));
app.use("/CSS", express.static(__dirname + "/src/views/CSS"));
app.use("/JS", express.static(__dirname + "/src/views/JavaScripts"));

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

//INDEX
app.get("/", (req, res) => {
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    dbo.collection("users").find({}).toArray(function(err, result) {
      if (err) throw err;
      chalk.magenta(console.log(result));
      if (req?.user) {
        console.log(req.user.name);   
        res.render("pages/index", { title: "home", results: result, name: req.user.username });
      }else {
        res.render("pages/index", { title: "home", results: result, name: "not login" });
      }
      
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
  res.render("pages/profile", { title: "Profile", name: req.user });
})
app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
  res.redirect('/');
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
