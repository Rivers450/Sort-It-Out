const {body} = require('express-validator');
const {validationResult} = require('express-validator');

exports.validateId = (req, res, next)=>{
    let id = req.params.id;

    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    }
}

exports.validateSignUp = [body('firstName', 'First name cannot be empty').notEmpty().trim().escape(),
    body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
    body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})];

exports.validateLogIn = [body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})];

exports.validateCrawl = [body('title', 'Title cannot be empty').notEmpty().trim().escape(),
    body('category', 'Category cannot be empty').notEmpty().trim().escape(),
    body('details', 'Details cannot be empty').notEmpty().trim().escape(),
    body('date', 'Date must be a valid date').isDate(),
    body('date', 'Date must be after today').isAfter().notEmpty().trim().escape(),
    body('location', 'Location cannot be empty').notEmpty().trim().escape(),
    body('startTime', 'Start time cannot be empty').notEmpty(),
    body('startTime', 'Start time must be a valid time').matches(/^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/).trim().escape(),
    body('endTime', 'End time cannot be empty').notEmpty(),
    body('endTime', 'End time must be a valid time').matches(/^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/).trim().escape(),
    body('image', 'Image cannot be empty').notEmpty().trim(),
    body('endTime').custom((endTime, {req})=>{
        let startTime = req.body.startTime;
        let startTimeMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
        let endTimeMinutes = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
        if(endTimeMinutes <= startTimeMinutes) {
            throw new Error('End time must be after start time');
        }
        return true;
    })];

exports.validateRsvp = [body('rsvp', 'Invalid RSVP').isIn(['Yes', 'No', 'Maybe'])];

exports.validateResult = (req, res, next)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}