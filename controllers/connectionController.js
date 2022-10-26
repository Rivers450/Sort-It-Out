const model = require('../models/connection');
const { DateTime, SystemZone } = require('luxon');
const Rsvp = require('../models/rsvp');

exports.index = (req, res, next)=>{
    model.find()
    .then(crawls=>{
        let categories = getCategories(crawls);
        res.render('./connection/connections', {crawls, categories});
    })
    .catch(err=>next(err));
};

exports.new = (req, res)=>{
    res.render('./connection/newConnection');
};

exports.create = (req, res, next)=>{
    let crawl = new model(req.body);
    crawl.host = req.session.user;
    crawl.save()
    .then(crawl=>{
        req.flash('success', 'Crawl created!')
        res.redirect('/connections')
    })
    .catch(err=>{
        if(err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

exports.show = (req, res, next)=>{
    let id = req.params.id;

    Promise.all([model.findById(id).populate('host', 'firstName lastName'),Rsvp.find({connection: id})])
    .then(crawl=>{
        if(crawl){
            let date = convertDate(crawl);
            const [crawls, rsvps] = crawl;
            return res.render('./connection/connection', {crawls, date, rsvps});
        } else {
            let err = new Error('Cannot find a story with id' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.edit = (req, res, next)=>{
    let id = req.params.id;
    
    model.findById(id)
    .then(crawl=>{
        if(crawl){
            let date = convertDateToEdit(crawl);
            return res.render('./connection/edit', {crawl, date});
        }
    })
    .catch(err=>next(err));
};

exports.update = (req, res, next)=>{
    let crawl = req.body;
    let id = req.params.id;

    model.findByIdAndUpdate(id, crawl, {useFindAndModify: false, runValidators: true})
    .then(crawl=>{
        if(crawl){
            req.flash('success', 'Crawl has been edited!');
            res.redirect('/connections/'+id);
        } else {
            let err = new Error('Cannot find a story with id' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>{
        if(err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

exports.createRsvp = (req, res, next)=>{
    let status = req.body.rsvp;
    let userId = req.session.user;
    let connectionId = req.params.id;

    Rsvp.findOneAndUpdate({connection: connectionId, user: userId}, {status: status}, {new: true, upsert: true, useFindAndModify: false, runValidators: true})
    .then(rsvp=>{
        req.flash('success', 'Successfully created your RSVP for this connection!');

        res.redirect('/users/profile');
    })
    .catch(err=>{
        if(err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
}

exports.delete = (req, res, next)=>{
    let id = req.params.id;

    Promise.all([model.findByIdAndDelete(id, {userFindAndModify: false}), Rsvp.deleteMany({connection: id}, {userFindAndModify: false})])
    .then(crawl=>{
        if(crawl) {
            req.flash('success', 'Crawl was deleted successfully!');
            res.redirect('/connections');
        } else {
            let err = new Error('Cannot find a story with id' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

function convertDate(crawl) {
    return DateTime.fromJSDate(crawl.date).toLocaleString({month: '2-digit', day: '2-digit', year: 'numeric'});
}

function convertDateToEdit(crawl) {
    return crawl.date.toISOString().split('T')[0];
}

function getCategories(crawls) {
    let categories = [];
    let i;

    crawls.forEach(crawl=>{
        if(!categories.includes(crawl.category)) {
            categories.push(crawl.category);
        }
    });

    return categories;
} 
