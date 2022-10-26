const model = require('../models/user');
const crawl = require('../models/connection');
const Rsvp = require('../models/rsvp');

exports.new = (req, res)=>{
    return res.render('./user/new');
};

exports.create = (req, res, next)=>{
    let user = new model(req.body);
    if(user.email) {
        user.email = user.email.toLowerCase();
    }
    user.save()
    .then(user=>{
        req.flash('success', 'Account created! Login!')
        res.redirect('/users/login')
    })
    .catch(err=>{
        if(err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('back');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used.');
            return res.redirect('back');
        }
        next(err);
    });
};

exports.getUserLogin = (req, res, next)=>{
    return res.render('./user/login');
};

exports.login = (req, res, next)=>{
    let email = req.body.email;
    if(email) {
        email = email.toLowerCase();
    }
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user=>{
        if(!user) {
            req.flash('error', 'Wrong email address.');
            res.redirect('back');
        } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.session.name = user.firstName;
                    req.flash('success', 'You have successfully logged in !');
                    res.redirect('/users/profile');
                } else {
                    req.flash('error', 'Wrong password.');
                    res.redirect('back');
                }
            });
        }
    })
    .catch(err=>next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), crawl.find({host: id}), Rsvp.find({user: id}).populate("connection")])
    .then(results=>{
        const [user, crawls, rsvps] = results;
        res.render('./user/profile', {user, crawls, rsvps});
    })
    .catch(err=>next(err));
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err)
            return next(err);
        else
            res.redirect('/');
    });
};