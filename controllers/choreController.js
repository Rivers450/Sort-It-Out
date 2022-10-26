const model = require("../models/chore");
// const userModel = require("../models/user");
const { DateTime, SystemZone } = require("luxon");

exports.index = (req, res, next) => {
  model
    .find()
    .then((chores) => {
      const updatedChores = chores.map(
        ({ deadline, title, assignedById, assignedToId, points }) => ({
          title,
          points,

          deadline: DateTime.fromJSDate(deadline).toLocaleString({
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
        })
      );
      res.render("./chore/chores", { chores: updatedChores });
    })
    .catch((err) => next(err));
};
