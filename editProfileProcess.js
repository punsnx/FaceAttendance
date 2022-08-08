var MongoClient = require("mongodb").MongoClient;
var url = process.env.CON_DB;
const client = new MongoClient(url);
const bcrypt = require("bcrypt");
const database = client.db("FaceAttendance");
const users = database.collection("users");
exports.editUserDetails = async (req, res) => {
  const query = { id: req.params.id };
  try {
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
    users.updateOne(query, newvalues);
  } catch (error) {
    res.redirect("/profile");
    console.log(error);
  } finally {
    req.user.email = req.body.editProfileEmail;
    req.user.username = req.body.editProfileUsername;
    req.user.firstname = req.body.editProfileFirstname;
    req.user.lastname = req.body.editProfileLastname;
    req.user.class = req.body.editProfileClass;
    req.user.room = req.body.editProfileRoom;
    req.user.no = req.body.editProfileNo;
    res.redirect("/profile");
  }
};
exports.editShowUsersEachUserDetails = async (req, res) => {
  const query = { id: req.params.id };
  var newvalues = {
    email: req.body.editProfileEmail,
    username: req.body.editProfileUsername,
    firstname: req.body.editProfileFirstname,
    lastname: req.body.editProfileLastname,
    class: req.body.editProfileClass,
    room: req.body.editProfileRoom,
    no: req.body.editProfileNo,
    role: req.body.editProfileRole,
  };
  try {
    var cursor = users.find(query);
    var result = await cursor.toArray();
    var hashPassword;
    //Don't Edit Password == SAME
    if (req.body.editProfilePassword == result[0].password) {
      hashPassword = result[0].password;
    } else if (
      //EDIT PASSWORD == NOT SAME
      !(await bcrypt.compare(req.body.editProfilePassword, result[0].password))
    ) {
      hashPassword = await bcrypt.hash(req.body.editProfilePassword, 10);
      newvalues.password = hashPassword;
    } else {
      return res.redirect(307, "/showusers");
    }
  } catch (error) {
    res.redirect(307, "/showusers");
    console.log(error);
  } finally {
    //Final Update Session & DB the redirect
    users.updateOne(query, { $set: newvalues });
    if (req.params.id == req.user.id) {
      req.user.email = req.body.editProfileEmail;
      req.user.username = req.body.editProfileUsername;
      req.user.firstname = req.body.editProfileFirstname;
      req.user.lastname = req.body.editProfileLastname;
      req.user.class = req.body.editProfileClass;
      req.user.room = req.body.editProfileRoom;
      req.user.no = req.body.editProfileNo;
      req.user.role = req.body.editProfileRole;
      req.user.password = hashPassword;
    }
    res.redirect(307, "/showusers");
  }
};

exports.deleteUserProfile = function (req, res) {};
