const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const groupSchema = new Schema({
  name: { type: String, required: [true, "Group name is required"] },
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  chores: [{ type: Schema.Types.ObjectId, ref: "Chore" }],
});

//collection name is groups in database
module.exports = mongoose.model("Group", groupSchema);
