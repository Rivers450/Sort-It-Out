const express = require('express');
const controller = require('../controllers/mainController');

const router = express.Router();

//GET /: send html page for home page
router.get('/', controller.home);

//GET /contact: send html page for contact page
router.get('/contact', controller.contact);

//GET /about: send html page for information about the site
router.get('/about', controller.about);

module.exports = router;