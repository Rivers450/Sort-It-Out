const express = require("express");
const controller = require("../controllers/choreController");
const { isLoggedIn } = require("../middlewares/auth");

const router = express.Router();

//GET /chores: send all chores to the user
router.get("/", isLoggedIn, controller.index);

// //POST /chore: create a new chore
router.post("/", controller.create);

// //DELETE /chores/:id: deletes a chore
router.delete("/:id", controller.delete);


// //PUT /chores/:id: update the chore identified by id
router.post("/:id", isLoggedIn, controller.update);

module.exports = router;
