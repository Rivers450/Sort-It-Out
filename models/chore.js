const mongoose = require("mongoose");
const { stringify } = require("uuid");

const Schema = mongoose.Schema;

const choreSchema = new Schema({
  //   id: { type: String, required: true },
  title: { type: String, required: [true, "Chore name is required"] },
  assignedTo: {
    type: String,
    required: [true, "Assigned to user id is required"],
  },
  assignedBy: { type: String, ref: "Group" },
  deadline: { type: Date, required: [true, "Deadline is required"] },
  repeat: { type: Boolean, required: true, default: false },
  points: { type: Number, required: true, default: 0 },
  completed: { type: Boolean, required: true, default: false },
});

//collection name is chores in database
module.exports = mongoose.model("Chore", choreSchema);
