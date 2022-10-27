const express = require("express");
const controller = require("../controllers/groupController");
const { isLoggedIn, isOwner } = require("../middlewares/auth");
const {validateId, validateGroup, validateResult} = require("../middlewares/validator");

const router = express.Router();

//GET /groups: send all groups to the user
router.get("/", isLoggedIn, controller.index);

//GET /newGroups: send html form for creating a new group
router.get('/newGroup', isLoggedIn, controller.new);

//POST /groups: create a new group
router.post('/', isLoggedIn, validateGroup, validateResult, controller.create);

//GET /groups/:id: send details of group identified by id
router.get('/:id', validateId, controller.show);

//GET /groups/:id/edit: send html form for editing an existing group
router.get('/:id/edit', validateId, isLoggedIn, isOwner, controller.edit);

//PUT /groups/:id: update the group identified by id
router.put('/:id', validateId, isLoggedIn, isOwner, validateGroup, validateResult, controller.update);

//DELETE /groups/:id: delete the group identified by id
router.delete('/:id', validateId, isLoggedIn, isOwner, controller.delete);

module.exports = router;