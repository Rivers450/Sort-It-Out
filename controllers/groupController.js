const model = require("../models/group");
const choreModel = require("../models/chore");
const userModel = require("../models/user");
const group = require("../models/group");

exports.index = (req, res, next) => {
  const user = req.session.user;
  model
    .find({ $or: [{ owner: user }, { members: { $in: [user] } }] })
    .then((groups) => {
      res.render("./group/groups", {
        groups,
        taskCreated: null,
      });
    })
    .catch((err) => next(err));
};

exports.new = (req, res) => {
  res.render("./group/newGroup");
};

exports.join = (req, res) => {
  res.render("./group/joinGroup");
};

exports.create = (req, res, next) => {
  let group = new model(req.body);
  group.owner = req.session.user;
  group.members = [];
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

exports.joinGroup = async (req, res) => {
  const { groupToJoin } = req.query;
  const member = req.session.user;
  const group = await model.findById({ id: groupToJoin });
  group.updateOne({ $set: { "members.$": member } });
  req.flash("Member Aded to the group");
  const groups = group.find({ owner: member });
  res.redirect("/groups", { groups });
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

exports.show = async (req, res) => {
  let id = req.params.id;

  const group = await model
    .findById(id)
    .populate("owner", "firstName lastName")
    .populate("member", "firstName lastName");
  if (group) {
    return res.render("./group/group", {
      group,
    });
  } else {
    let err = new Error("Cannot find a group with id" + id);
    err.status = 404;
  }
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
