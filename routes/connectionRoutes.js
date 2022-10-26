const express = require('express');
const controller = require('../controllers/connectionController');
const {isLoggedIn, isHost, isNotHost} = require('../middlewares/auth');
const {validateId, validateCrawl, validateRsvp, validateResult} = require('../middlewares/validator');

const router = express.Router();

//GET /connections: send all connections to the user
router.get('/', controller.index);

//GET /newConnections: send html form for creating a new story
router.get('/newConnection', isLoggedIn, controller.new);

//POST /connections: create a new crawl
router.post('/', isLoggedIn, validateCrawl, validateResult, controller.create);

//GET /connections/:id: send details of crawl identified by id
router.get('/:id', validateId, controller.show);

//GET /connections/:id/edit: send html form for editing an existing crawl
router.get('/:id/edit', validateId, isLoggedIn, isHost, controller.edit);

//PUT /connections/:id: update the crawl identified by id
router.put('/:id', validateId, isLoggedIn, isHost, validateCrawl, validateResult, controller.update);

//DELETE /connections/:id: delete the crawl identified by id
router.delete('/:id', validateId, isLoggedIn, isHost, controller.delete);

//POST /connections/:id/rsvp: route rsvp requests
router.post('/:id/rsvp', validateId, isLoggedIn, isNotHost, validateRsvp, validateResult, controller.createRsvp);

module.exports = router;