const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const forgotPass = new Schema({
  email: {
    type: String,
    required: [true, "email address is required"],
    unique: [true, "this email address has been used"],
  },
  code: { type: String, required: [true, "code is required"] },
});

module.exports = mongoose.model("ForgotPass", forgotPass);
