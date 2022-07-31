const googleCloud = require("./googleCloud");
const fs = require("fs");
const formidable = require("formidable");
// The ID of your GCS bucket
const bucketName = 'skdev-356007.appspot.com';
// The filename and file path where you want to download the file
// const destFileName = '/Users/sirisuk/Downloads/47539_punsn.jpeg';
// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
const { info, error } = require("console");
// Creates a client
const storage = new Storage({keyFilename: 'skdev-356007-70b2ea60723d.json'});

var MongoClient = require("mongodb").MongoClient;
var url = process.env.CON_DB;

exports.uploadProfile = (req,res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.send(err);
      } else {
        //res.json({ files });
        var oldpath = files.profileIMGuploading.filepath;
        var newpath = "IMG/user_profile/" + req.user.studentID + "_" + req.user.username + ".jpeg";
        try {
          await googleCloud.uploadFile(oldpath, newpath);
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
};

exports.deleteProfile = (req, res) => {
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
};