app.post('/process/uploadprofile', checkAuthenticated, (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.send(err);
      } else {
        //res.json({ files });
        var oldpath = files.profileIMGuploading.filepath;
        await uploadFile(oldpath, "IMG/user_profile/" + req.user.studentID + "_" + req.user.username + ".jpeg");
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