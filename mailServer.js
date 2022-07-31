const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kkhaopunkungz3487@gmail.com",
    pass: "LtbdXflbIy%MZX94",
  },
});

exports.forgetPasswordProcess = (req, res) => {
  try {
    var mailOptions = {
      from: "kkhaopunkungz3487@gmail.com",
      to: req.body.forgetPassEmailInput,
      subject: "Sending Email using Node.js",
      text: "That was easy!",
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.redirect("/forgetpassword");
  } catch (error) {}
};
