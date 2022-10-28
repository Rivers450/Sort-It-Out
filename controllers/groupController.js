const model = require("../models/group");
const choreModel = require("../models/chore");

exports.index = (req, res, next) => {
  model
    .find()
    .then((groups) => {
      res.render("./group/groups", { groups, taskCreated: null });
    })
    .catch((err) => next(err));
};

exports.new = (req, res) => {
  res.render("./group/newGroup");
};

exports.create = (req, res, next) => {
  let group = new model(req.body);
  group.owner = req.session.user;
  group
    .save()
    .then((group) => {
      req.flash("success", "Group created!");
      res.redirect("/groups");
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      next(err);
    });
};

exports.choreForm = async (req, res) => {
  const { groupId } = req.params;
  const [group] = await model.find({ id: groupId });
  res.render("./chore/choreForm", { groupId, member: group.members });
};

exports.createChores = async (req, res) => {
  try {
    const { title, assignedBy, assignedTo, points, deadline } = req.body;
    await new choreModel({
      title,
      assignedBy,
      assignedTo,
      points,
      deadline,
    }).save();
    req.flash("success", "Chore created!");
    res.redirect("/groups");
  } catch (err) {
    console.log(err);
    req.flash("Failed", "Chore creation failed!");
    res.redirect("/groups");
  }
};

exports.show = (req, res, next) => {
  let id = req.params.id;

  Promise.all([model.findById(id).populate("owner", "firstName lastName")])
    .then((group) => {
      if (group) {
        const [groups] = group;
        return res.render("./group/group", { groups });
      } else {
        let err = new Error("Cannot find a group with id" + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};

exports.edit = (req, res, next) => {
  let id = req.params.id;

  model
    .findById(id)
    .then((group) => {
      if (group) {
        return res.render("./group/edit", { group });
      }
    })
    .catch((err) => next(err));
};

exports.update = (req, res, next) => {
  let group = req.body;
  let id = req.params.id;

  model
    .findByIdAndUpdate(id, group, {
      useFindByAndModify: false,
      runValidators: true,
    })
    .then((group) => {
      if (group) {
        req.flash("success", "Group has been edited!");
        res.redirect("/groups/" + id);
      } else {
        let err = new Error("Cannot find a group with id" + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};

exports.delete = (req, res, next) => {
  let id = req.params.id;

  Promise.all([model.findByIdAndDelete(id, { userFindAndModify: false })])
    .then((group) => {
      if (group) {
        req.flash("success", "Group was deleted successfully!");
        res.redirect("/groups");
      } else {
        let err = new Error("Cannot find a group with id" + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};
