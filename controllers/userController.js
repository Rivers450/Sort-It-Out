const model = require("../models/user");
// const crawl = require("../models/connection");
//const Rsvp = require("../models/rsvp");
const bcrypt = require("bcrypt");

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
      res.redirect("/users/login");
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
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Wrong email address.");
        res.redirect("back");
      } else {
        user.comparePassword(password).then((result) => {
          if (result) {
            req.session.user = user._id;
            req.session.name = user.firstName;
            req.flash("success", "You have successfully logged in !");
            res.redirect("/users/profile");
          } else {
            req.flash("error", "Wrong password.");
            res.redirect("back");
          }
        });
      }
    })
    .catch((err) => next(err));
};

exports.profile = async (req, res) => {
  let id = req.session.user;
  const user = await model.findById(id);
  // crawl.find({ host: id }),
  // Rsvp.find({ user: id }).populate("connection"),
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
  console.log(curUser);
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
