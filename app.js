if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
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
const httpStorage = require("./httpStorage.js");
const initializePassport = require("./passport-config.js");
// The ID of your GCS bucket
const bucketName = 'skdev-356007.appspot.com';
// The filename and file path where you want to download the file
// const destFileName = '/Users/sirisuk/Downloads/47539_punsn.jpeg';
// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
const { info, error } = require("console");
// Creates a client
const storage = new Storage({keyFilename: 'skdev-356007-70b2ea60723d.json'});

initializePassport(
  passport
  //  email => users.find(user => user.email === email),
  //  id => users.find(user => user.id === id)
)
var MongoClient = require("mongodb").MongoClient;
var url = process.env.CON_DB;
//app.use
app.use(morgan("combined"));
app.use("/CSS", express.static(__dirname + "/src/views/CSS"));
app.use("/JS", express.static(__dirname + "/src/views/JavaScripts"));
app.use("/IMG", express.static(__dirname + "/src/views/IMG"));

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, //if notthing has changed >> dont't resave
    saveUninitialized: false, // don't save empty values in the session
  })
);
app.use(passport.initialize());
app.use(passport.session());

//app.set
app.set("views", "./src/views");
app.set("view engine", "ejs");


//HTTP Storage
//TEST Google Cloud Storage
app.get("/storage/user_profile/:path", async (req, res) => {
  //httpStorage(req, res);
  await storage.bucket(bucketName).file("IMG/user_profile/" + req.params.path).createReadStream().pipe(res);
  
  
  
});

//INDEX
app.get("/", (req, res) => {
  if (req?.user) {
    console.log(req.user.name);
    res.status(200).render("pages/index", { title: "home", name: "welcome " + req.user.username });
  } else {
    res.status(200).render("pages/index", { title: "home", name: "not login" });
  }

});
app.post("/showusers", (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    dbo.collection("users").find({}).toArray(function (err, result) {
      if (err) throw err;
      //chalk.magenta(console.log(result));
      try {
        result.forEach(info => {
          if (info.profileFile != undefined) {
            info.profileFile = req.protocol + "://" + req.header('host') + "/storage/user_profile/" + info.profileFile;
          } else {
            info.profileFile = "IMG/noimg.jpeg";
          }
          
        });
        res.render("pages/showusers", { results: result });

      } catch {
        console.error();
      }
      db.close();
    });
  });
});
//Login
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("pages/login", { title: "login" });
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
//Auth
app.get("/auth", checkNotAuthenticated, (req, res) => {
  res.render("pages/auth", { title: "authentication", alertauth: [] });
});
app.post("/auth", async (req, res) => {
  if (req.body.authPassword == req.body.authCFPassword) {
    try {
      hashedPassword = await bcrypt.hash(req.body.authPassword, 10);
      authProcess(req, res, hashedPassword); //Insert DB
    } catch {
      res.render("pages/auth", {
        title: "authentication",
        alertauth: "hash / db error",
      });
    }
  } else {
    res.render("pages/auth", {
      title: "authentication",
      alertauth: "Password not same",
    });
  }
});
//Profile
app.get("/profile", checkAuthenticated, (req, res) => {
  if (req.user.profileFile != undefined){
    res.render("pages/profile", {
      title: "Profile", name: req.user,
      profileFile: req.protocol + "://" + req.header('host') + "/storage/user_profile/" + req.user.profileFile
      //profileFile: req.user.profileFile
    });
  } else {
    res.render("pages/profile", {
      title: "Profile", name: req.user,
      profileFile: "IMG/noimg.jpeg"
      //profileFile: req.user.profileFile
    });
  }

})
app.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});



app.post('/process/uploadprofile', checkAuthenticated, (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.send(err);
    } else {
      //res.json({ files });
      var oldpath = files.profileIMGuploading.filepath;
      var newpath = "IMG/user_profile/" + req.user.studentID + "_" + req.user.username + ".jpeg";
      try {
        await uploadFile(oldpath, newpath);
        fs.unlinkSync(oldpath);
        insertProfileToDB(req);
        req.user.profileFile = req.user.studentID + "_" + req.user.username + ".jpeg";
        res.redirect("/profile")
        //file removed
      } catch {
        console.error();
      }
    }
  });
});
//DELETE PROFILE
app.post('/process/deleteprofile', checkAuthenticated, (req, res) => {
  if (req.user.profileFile != undefined) {
    try {
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("FaceAttendance");
        var myquery = { id: req.user.id };
        var newvalues = { $set: { profileFile: undefined } };
        dbo.collection("users").updateOne(myquery, newvalues, function (err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        });
      });
      storage.bucket(bucketName).file("IMG/user_profile/" + req.user.profileFile).delete();
      req.user.profileFile = undefined;
      res.redirect("/profile")
    } catch {
      res.redirect("/profile")
    }
  } else {
    res.redirect("/profile")
  }

});

const PORT = port || parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}
function insertProfileToDB(req) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    var myquery = { id: req.user.id };
    var profileName = req.user.studentID + "_" + req.user.username + ".jpeg";
    //, httpProfilePath: "/storage/user_profile/" + profileName
    var newvalues = { $set: { profileFile: profileName } };
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
async function uploadFile(uploadFilePath, destFileName) {
  await storage.bucket(bucketName).upload(uploadFilePath, {
    destination: destFileName,
  });

  console.log(`${uploadFilePath} uploaded to ${bucketName}`);
}