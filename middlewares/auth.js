const Crawl = require('../models/connection');

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

//checks if user is host of crawl
exports.isHost = (req, res, next)=>{
    let id = req.params.id;

    Crawl.findById(id)
    .then(crawl=>{
        if(crawl) {
            if(crawl.host == req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource.');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a story with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};

//check if user is not host of crawl
exports.isNotHost = (req, res, next)=>{
    let id = req.params.id;

    Crawl.findById(id)
    .then(crawl=>{
        if(crawl) {
            if(crawl.host == req.session.user) {
                console.log("in isnothost if");
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            } else {
                return next();
            }
        } else {
            let err = new Error('Cannot find a story with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};