const model = require("../models/chore");
// const userModel = require("../models/user");
const { DateTime, SystemZone } = require("luxon");

const listChores = async (req, res) => {
  try {
    const chores = await model
      .find()
      .populate("assignedBy")
      .populate("assignedTo");
    const completedChores = chores
      .filter(({ completed }) => completed)
      .map(mapFieldsToCorrectValues);

    const todoChores = chores
      .filter(({ completed }) => !completed)
      .map(mapFieldsToCorrectValues);
    res.render("./chore/chores", { completedChores, todoChores });
  } catch (err) {
    console.log(err);
  }
};

exports.index = listChores;

exports.create = async (req, res) => {
  try {
    await new model(req.body).save();
    return await listChores(req, res);
  } catch (err) {
    console.log(err);
  }
};
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await model.deleteOne({ id });
    return await listChores(req, res);
  } catch (err) {
    console.log(err);
  }
};
/**
 * This is a helper function to update the existing list with correct data format
 *
 * @param {chores} param0 List of chores
 * @returns list of chores with updated field values
 */
const mapFieldsToCorrectValues = ({
  deadline,
  title,
  assignedBy,
  assignedTo,
  points,
}) => ({
  title,
  points,
  assignedTo,
  assignedBy,
  markCompleted: (title) => alert(`About to complete this ${title}`),
  deadline: DateTime.fromJSDate(deadline).toLocaleString({
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }),
});
