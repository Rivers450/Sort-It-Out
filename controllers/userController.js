const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const model = require("../models/user");
const forgotPass = require("../models/forgotPass");

exports.new = (req, res) => {
  return res.render("./user/new");
};

exports.create = (req, res, next) => {
  let user = new model(req.body);
  if (user.email) {
    user.email = user.email.toLowerCase();
  }
  user
    .save()
    .then((user) => {
      req.flash("success", "Account created! Login!");
      res.redirect("/users/loginForm");
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("back");
      }

      if (err.code === 11000) {
        req.flash("error", "Email has been used.");
        return res.redirect("back");
      }
      next(err);
    });
};

exports.getUserLogin = (req, res, next) => {
  return res.render("./user/login");
};

exports.login = (req, res, next) => {
  let email = req.body.email;
  if (email) {
    email = email.toLowerCase();
  }
  let password = req.body.password;
  model
    .findOne({ email })
    .then((user) => {
      if (!user) {
        console.log(user, email);
        req.flash("error", "Wrong email address.");
        res.redirect("/users/loginForm");
      } else {
        user.comparePassword(password).then((result) => {
          if (result) {
            req.session.user = user._id;
            req.session.name = user.firstName;
            req.flash("success", "You have successfully logged in !");
            res.redirect("/users/profile");
          } else {
            req.flash("error", "Wrong password.");
            res.redirect("/users/loginForm");
          }
        });
      }
    })
    .catch((err) => next(err));
};

exports.profile = async (req, res) => {
  let id = req.session.user;
  const user = await model.findById(id);
  res.render("./user/profile", { user });
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    else res.redirect("/");
  });
};

exports.resetPwform = async (_, res) => {
  return res.render("./user/resetpw");
};

exports.reset = async (req, res) => {
  let pw = req.body.currentPW;
  let nPW = req.body.newPW;
  let rNPW = req.body.rNewPW;
  if (pw === nPW) {
    req.flash(
      "error",
      "Your new password should not be same as your previous password."
    );
    return res.redirect("/users/resetPwform");
  }

  if (nPW !== rNPW) {
    req.flash("error", "The new passwords do not match.");
    return res.redirect("/users/resetPwform");
  }
  let userId = req.session.user;
  const curUser = await model.findById(userId);
  const isPasswordValid = await curUser.comparePassword(pw);
  if (!isPasswordValid) {
    req.flash("error", "Invalid current password.");
    return res.redirect("/users/resetPwform");
  }
  curUser.password = nPW;
  try {
    await curUser.save();
  } catch (err) {
    console.log(err);
  }
  req.flash("success", "Your password has been reset. ");
  return res.redirect("/users/profile");
};

exports.forgotPasswordEmail = (_, res) => {
  res.render("./user/forgotPasswordEmail");
};

exports.forgotPasswordForm = async (req, res) => {
  const { newPW, rNewPW, email } = req.body;
  if (newPW !== rNewPW) {
    req.flash("error", "The new passwords do not match.");
    return res.redirect("back");
  }
  const curUser = await model.findOne({ email });
  curUser.password = newPW;
  try {
    await curUser.save();
  } catch (err) {
    console.log(err);
  }
  req.flash("success", "Your password has been reset. ");
  return res.redirect("/users/loginForm");
};

exports.forgotPassword = (host, port) => async (req, res) => {
  console.log("my mailer:", req.mailer);
  // 1. Get email from req.params
  const { email } = req.body;
  // 2. Check if email exists in DB
  const curUser = await model.findOne({ email });
  if (!curUser) {
    req.flash(
      "error",
      "Email is not found in our system. Please verify your email address and proceed. "
    );
    return res.redirect("/users/forgotPasswordEmail");
  }
  // 3.0 Generate a one-time use code and store it in the db against the email
  const code = uuidv4();
  await forgotPass.updateOne({ email }, { email, code }, { upsert: true });
  const link = encodeURI(
    `${host}:${port}/users/resetPasswordLink?code=${code}&email=${email}`
  );

  const message = {
    to: `${curUser.firstName} ${curUser.lastName} <${email}>`,
    from: "sortitout756@gmail.com",
    subject: "Forgot password for SortItOut!",
    content: [
      {
        type: "text/html",
        value: `<p>
       Hello ${curUser.firstName}, <br/>
    Thank you for using SortItOut. To reset your password please copy the link below to your browser so you can go ahead and create a new password.<br> 
    Link: ${link}
    <br/>
    Thank you, 
    <br/>
    Sort-It-Out Support team
    </p>`,
      },
    ],
  };

  await req.sgMail.send(message);
  console.log(message);
  // 3. 1 Send a link to the email with code
  // 4. Have a route to handle the clicked link
  // 4.0 Check if the code passed is the same as the code in 3.0
  // 4.1 Load the forgetPassword form
  req.flash(
    "success",
    "Please check your email and follow the instruction to reset your password."
  );
  return res.redirect("/users/forgotPasswordEmail");
};

exports.resetPasswordLink = async (req, res) => {
  const { code, email } = req.query;
  const forgotPassData = await forgotPass.findOne({ code });
  if (!forgotPassData) {
    req.flash("error", "Invalid link. Please restart the process again.");
    return res.redirect("/users/forgotPasswordEmail");
  }
  res.render("./user/forgotPassword", { email });
};
