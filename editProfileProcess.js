var MongoClient = require("mongodb").MongoClient;
var url = process.env.CON_DB;

exports.editUserDetails = (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(process.env.CON_DB_NAME);
    var myquery = { id: req.user.id };
    var newvalues = {
      $set: {
        email: req.body.editProfileEmail,
        username: req.body.editProfileUsername,
        firstname: req.body.editProfileFirstname,
        lastname: req.body.editProfileLastname,
        class: req.body.editProfileClass,
        room: req.body.editProfileRoom,
        no: req.body.editProfileNo,
      },
    };
    dbo
      .collection(process.env.CON_DB_COLLECTION)
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log("Account 1 document updated");
        db.close();
      });
  });
  req.user.email = req.body.editProfileEmail;
  req.user.username = req.body.editProfileUsername;
  req.user.firstname = req.body.editProfileFirstname;
  req.user.lastname = req.body.editProfileLastname;
  req.user.class = req.body.editProfileClass;
  req.user.room = req.body.editProfileRoom;
  req.user.no = req.body.editProfileNo;
  res.redirect("/profile");
};
exports.editShowUsersEachUserDetails = async (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    var query = { id: req.params.id };
    dbo
      .collection("users")
      .find(query)
      .toArray(async function (err, result) {
        if (err) throw err;
        if (req.body.editProfilePassword == result[0].password) {
          var checkPassword = req.body.editProfilePassword;
        } else {
          try {
            hashedPassword = await bcrypt.hash(
              req.body.editProfilePassword,
              10
            );
            var checkPassword = hashedPassword;
          } catch (error) {
            res.redirect(307, "/showusers");
          }
        }
        try {
          MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db(process.env.CON_DB_NAME);
            var myquery = { id: req.params.id };
            var newvalues = {
              $set: {
                email: req.body.editProfileEmail,
                username: req.body.editProfileUsername,
                firstname: req.body.editProfileFirstname,
                lastname: req.body.editProfileLastname,
                class: req.body.editProfileClass,
                room: req.body.editProfileRoom,
                no: req.body.editProfileNo,
                role: req.body.editProfileRole,
                password: checkPassword,
              },
            };
            dbo
              .collection(process.env.CON_DB_COLLECTION)
              .updateOne(myquery, newvalues, function (err, res) {
                if (err) throw err;
                console.log("Account 1 document updated");
                db.close();
              });
          });
          if (req.params.id == req.user.id) {
            req.user.email = req.body.editProfileEmail;
            req.user.username = req.body.editProfileUsername;
            req.user.firstname = req.body.editProfileFirstname;
            req.user.lastname = req.body.editProfileLastname;
            req.user.class = req.body.editProfileClass;
            req.user.room = req.body.editProfileRoom;
            req.user.no = req.body.editProfileNo;
            req.user.role = req.body.editProfileRole;
            req.user.password = checkPassword;
          }
          res.redirect(307, "/showusers");
        } catch (error) {
          res.redirect(307, "/showusers");
        }
        db.close();
      });
  });
};
exports.deleteUserProfile = function (req, res) {};
