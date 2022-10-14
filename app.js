if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
} // if it's development >> require development tendency of dotenv
//load in all of our different environment variables and set them inside process of dotenv
const port = process.env.port;
const express = require("express");
const https = require("https");
const http = require("http");
const app = express();
const debug = require("debug");
const chalk = require("chalk");
const mongoose = require("mongoose");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const bcrypt = require("bcrypt");
const formidable = require("formidable");
const fs = require("fs");
const authProcess = require("./authentication.js");
const httpStorage = require("./httpStorage.js");
const initializePassport = require("./passport-config.js");
const googleCloud = require("./googleCloud");
const editProfileProcess = require("./editProfileProcess.js");
const mailServer = require("./mailServer");
const dataCompute = require("./dataCompute.js");
const editDataProcess = require("./editDataProcess");

// The ID of your GCS bucket
const bucketName = "skdev-356007.appspot.com";
// The filename and file path where you want to download the file
// const destFileName = '/Users/sirisuk/Downloads/47539_punsn.jpeg';
// Imports the Google Cloud client library
const { Storage } = require("@google-cloud/storage");
const { info, error } = require("console");
// Creates a client
const storage = new Storage({ keyFilename: "skdev-356007-70b2ea60723d.json" });

initializePassport(
  passport
  //  email => users.find(user => user.email === email),
  //  id => users.find(user => user.id === id)
);
var MongoClient = require("mongodb").MongoClient;
var url = process.env.CON_DB;
const client = new MongoClient(url);
const database = client.db("FaceAttendance");
const users = database.collection("users");
//app.use
app.use(morgan("combined"));
app.use("/CSS", express.static(__dirname + "/src/views/CSS"));
app.use("/JS", express.static(__dirname + "/src/views/JavaScripts"));
app.use("/IMG", express.static(__dirname + "/src/views/IMG"));
app.use("/DirHome", express.static(__dirname));

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
  await storage
    .bucket(bucketName)
    .file("IMG/user_profile/" + req.params.path)
    .createReadStream()
    .pipe(res);
});

//INDEX
app.get("/", checkAuthenticated, (req, res) => {
  if (req?.user) {
    console.log(req.user.name);
    res.status(200).render("pages/index", {
      title: "home",
      name: "welcome " + req.user.username + ", " + req.user.role,
    });
  } else {
    res.status(200).render("pages/index", {
      title: "home",
      name: "not login",
    });
  }
});
//getchart
app.post("/process/get/chart", (req, res) => {
  dataCompute.computeIndex(req, res);
});
//getLastLogin
app.post("/process/get/lastlogin", (req, res) => {
  dataCompute.computeLastLogin(req, res);
});
//SHOW USER
app.post("/showusers", checkAdminAuthenticated, (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    dbo
      .collection("users")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        //chalk.magenta(console.log(result));
        try {
          result.forEach((info) => {
            if (info.profileFile != undefined) {
              info.profileFile =
                req.protocol +
                "://" +
                req.header("host") +
                "/storage/user_profile/" +
                info.profileFile;
            } else {
              info.profileFile = "IMG/noimg.jpeg";
            }
          });
          res.render("pages/showusers", {
            results: result,
            title: "showusers",
          });
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
//Forget password
app.get("/forgetpassword", checkNotAuthenticated, (req, res) => {
  res.render("pages/forgetpassword", { title: "forgetpassword" });
});
app.post("/process/forgetpassword", checkNotAuthenticated, (req, res) => {
  mailServer.forgetPasswordProcess(req, res);
});
//Auth
app.get("/auth", checkNotAuthenticated, (req, res) => {
  res.render("pages/auth", {
    title: "authentication",
    alertauth: [],
    status: "success",
  });
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
        status: "error",
      });
    }
  } else {
    res.render("pages/auth", {
      title: "authentication",
      alertauth: "Password not same",
      status: "error",
    });
  }
});
//Profile
app.get("/profile", checkAuthenticated, (req, res) => {
  if (req.user.profileFile != undefined) {
    res.render("pages/profile", {
      title: "Profile",
      name: req.user,
      profileFile:
        req.protocol +
        "://" +
        req.header("host") +
        "/storage/user_profile/" +
        req.user.profileFile,
      //profileFile: req.user.profileFile
    });
  } else {
    res.render("pages/profile", {
      title: "Profile",
      name: req.user,
      profileFile: "IMG/noimg.jpeg",
      //profileFile: req.user.profileFile
    });
  }
});
//editProfileDetails
app.post(
  "/process/editProfileDetails",
  checkAuthenticated,
  async (req, res) => {
    if (await bcrypt.compare(req.body.editProfilePassword, req.user.password)) {
      try {
        console.log("connect!!!!");
        editProfileProcess.editUserDetails(req, res);
      } catch (e) {
        console.log(e);
      }
    } else {
      res.redirect("/profile");
    }
  }
);
//showusers editEachProfileDetails
app.post(
  "/process/showusers/editEachProfileDetails/:id/:studentID/",
  checkAuthenticated,
  (req, res) => {
    if (req.body.editProfileCFPassword == req.body.editProfilePassword) {
      editProfileProcess.editShowUsersEachUserDetails(req, res);
    } else {
      res.redirect(307, "/showusers");
    }
  }
);
//DATA PAGE
app.get("/data", checkAuthenticated, async (req, res) => {
  if (req.user.profileFile != undefined) {
    res.render("pages/data", {
      title: "Data",
      reqrole: req.user.role,
      user: req.user,
      profileFile:
        req.protocol +
        "://" +
        req.header("host") +
        "/storage/user_profile/" +
        req.user.profileFile,
    });
  } else {
    res.render("pages/data", {
      title: "Profile",
      reqrole: req.user.role,
      user: req.user,
      profileFile: "IMG/noimg.jpeg",
      //profileFile: req.user.profileFile
    });
  }
});
app.get("/data/:studentID", checkAuthenticated, async (req, res) => {
  const cursor = users.find({ studentID: req.params.studentID });
  var result = await cursor.toArray();
  if (result.length > 0) {
    if (result[0].profileFile != undefined) {
      res.render("pages/data", {
        title: "Data",
        reqrole: req.user.role,
        user: result[0],
        profileFile:
          req.protocol +
          "://" +
          req.header("host") +
          "/storage/user_profile/" +
          result[0].profileFile,
      });
    } else {
      res.render("pages/data", {
        title: "Profile",
        reqrole: req.user.role,
        user: result[0],
        profileFile:
          req.protocol + "://" + req.header("host") + "/IMG/noimg.jpeg",

        //profileFile: req.user.profileFile
      });
    }
  } else {
    res.send("NO USER");
  }
});
//LOGOUT
app.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
//upload profile
app.post("/process/uploadprofile", checkAuthenticated, (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.send(err);
    } else {
      //res.json({ files });
      var oldpath = files.profileIMGuploading.filepath;
      var newpath = "IMG/user_profile/" + req.user.studentID + ".jpeg";
      try {
        await googleCloud.uploadFile(oldpath, newpath);
        fs.unlinkSync(oldpath);
        insertProfileToDB(req);
        req.user.profileFile = req.user.studentID + ".jpeg";
        res.redirect("/profile");
        //file removed
      } catch {
        console.error();
      }
    }
  });
});
//showusers upload profile
app.post(
  "/process/showusers/uploadprofile/:id/:studentID",
  checkAuthenticated,
  (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.send(err);
      } else {
        //res.json({ files });
        var oldpath = files.profileIMGuploading.filepath;
        var newpath = "IMG/user_profile/" + req.params.studentID + ".jpeg";
        try {
          await googleCloud.uploadFile(oldpath, newpath);
          insertShowUsersProfileToDB(req.params.id, req.params.studentID);
          fs.unlinkSync(oldpath);

          if (req.params.id == req.user.id) {
            req.user.profileFile = req.params.studentID + ".jpeg";
          }
          res.redirect(307, "/showusers");
          //file removed
        } catch {
          console.error();
        }
      }
    });
  }
);

//DELETE PROFILE
app.post("/process/deleteprofile", checkAuthenticated, (req, res) => {
  if (req.user.profileFile != undefined) {
    try {
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("FaceAttendance");
        var myquery = { id: req.user.id };
        var newvalues = { $set: { profileFile: undefined } };
        dbo
          .collection("users")
          .updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
          });
      });
      storage
        .bucket(bucketName)
        .file("IMG/user_profile/" + req.user.profileFile)
        .delete();
      req.user.profileFile = undefined;
      res.redirect("/profile");
    } catch {
      res.redirect("/profile");
    }
  } else {
    res.redirect("/profile");
  }
});
//showusers DELETE PROFILE
app.post(
  "/process/showusers/deleteprofile/:id/:studentID",
  checkAuthenticated,
  async (req, res) => {
    const query = { id: req.params.id };
    const newvalues = { $set: { profileFile: undefined } };
    try {
      const cursor = users.find(query);
      var result = await cursor.toArray();
      if (result[0].profileFile != undefined) {
        try {
          users.updateOne(query, newvalues, async () => {
            await client.close();
          });
        } catch (error) {
          console.log(error);
        } finally {
          storage
            .bucket(bucketName)
            .file("IMG/user_profile/" + req.params.studentID + ".jpeg")
            .delete();
          if (req.params.id == req.user.id) {
            req.user.profileFile = undefined;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }

    res.redirect(307, "/showusers");
  }
);
// get init Data Page Data Of User
app.post(
  "/process/get/dataOfUser/:dateHistory/:studentID/",
  checkAuthenticated,
  async (req, res) => {
    dataCompute.computeDataOfUser(req, res);
  }
);
// get init Data Page Data Of User Monthly
app.post(
  "/process/get/dataOfUserMonthly/:dateHistory/:studentID/",
  checkAuthenticated,
  async (req, res) => {
    dataCompute.computeDataOfUserMonthly(req, res);
  }
);
// get init Data Page class items
app.post("/process/get/classitems", checkAuthenticated, async (req, res) => {
  dataCompute.computeUsersClassCount(req, res);
});
//data compute list users form filter
app.post(
  "/process/get/datahistory/studentlist/:dateHistory/:class/:room/",
  checkAuthenticated,
  (req, res) => {
    dataCompute.computeDataHistoryStudentList(req, res);
  }
);
app.post(
  "/process/editattendancestate/:dateSearch/:studentID/:name/:currentState/:newState/",
  checkAuthenticated,
  (req, res) => {
    editDataProcess.editEachAttendance(req, res);
  }
);

const PORT = 3000 || parseInt(process.env.PORT) || 8080;
http.createServer(app).listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
https
  .createServer(
    // Provide the private and public key to the server by reading each
    // file's content with the readFileSync() method.
    {
      key: fs.readFileSync("key.pem"),
      cert: fs.readFileSync("cert.pem"),
    },
    app
  )
  .listen(443, () => {
    console.log("RUN HTTPS 443");
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
function checkAdminAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.role == "admin") {
    return next();
  }
  res.redirect("/");
}
function insertProfileToDB(req) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    var myquery = { id: req.user.id };
    // var profileName = req.user.studentID + "_" + req.user.username + ".jpeg";
    var profileName = req.user.studentID + ".jpeg";
    //, httpProfilePath: "/storage/user_profile/" + profileName
    var newvalues = { $set: { profileFile: profileName } };
    dbo.collection("users").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
}
function insertShowUsersProfileToDB(id, studentID) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    var myquery = { id: id };
    // var profileName = req.user.studentID + "_" + req.user.username + ".jpeg";
    var profileName = studentID + ".jpeg";
    //, httpProfilePath: "/storage/user_profile/" + profileName
    var newvalues = { $set: { profileFile: profileName } };
    dbo.collection("users").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
}

module.exports = app;
