const express = require("express");
const controller = require("../controllers/friendController");
const { isLoggedIn } = require("../middlewares/auth");

const router = express.Router();

//GET /friends: send all friends to the user
router.get("/", isLoggedIn, controller.index);

module.exports = router;