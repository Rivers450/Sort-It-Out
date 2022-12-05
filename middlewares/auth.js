const Group = require('../models/group');

//checks if user is a guest
exports.isGuest = (req, res, next)=>{
    if(!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already.');
        return res.redirect('/users/profile');
    }
};

//checks if user is authenticated
exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first.');
        return res.redirect('/users/login');
    }
};

//checks if user is owner of group
exports.isOwner = (req, res, next)=>{
    let id = req.params.id;

    Group.findById(id)
    .then(group=>{
        if(group) {
            if(group.owner == req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource.');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a group with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};

//check if user is not owner of group
exports.isNotOwner = (req, res, next)=>{
    let id = req.params.id;

    Group.findById(id)
    .then(group=>{
        if(group) {
            if(group.owner == req.session.user) {
                console.log("in isnotowner if");
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            } else {
                return next();
            }
        } else {
            let err = new Error('Cannot find a group with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};