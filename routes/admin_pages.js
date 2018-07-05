var express = require('express');
var router = express.Router();

//GET Page model
var Page = require('../models/page');

// GET page index
router.get('/', function (req, res) {
    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
        res.render('admin/pages/pages',{
            pages: pages
        })
    });
});

// GET add pages
router.get('/add-page', function (req, res) {
    var title = '';
    var slug = '';
    var content = '';

    res.render('admin/pages/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

// POST add pages
router.post('/add-page', function (req, res) {

    req.checkBody('title', 'Title must have value').not().isEmpty();
    req.checkBody('content', 'Content must have value').not().isEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;
    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/pages/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Page.findOne({slug: slug},function (err, page) {
            if(page){
                req.flash('danger', 'Page slug is exists, choose another.');
                res.render('admin/pages/add_page',{
                    title: title,
                    slug: slug,
                    content: content
                });
            }else{
                var pageNew = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });

                pageNew.save(function(err){
                    if(err) return console.log(err);

                    Page.find().sort({sorting: 1}).exec(function (err, pages) {
                        if(err){
                            return console.log(err);
                        }else{
                            req.app.locals.pages = pages;
                        }
                    });

                    req.flash('success','Page added!');
                    res.redirect('/admin/pages');
                })
            }
        });
    }

});

// Sort pages function
function sortPages(ids, cb) {

    for(let i = 0; i < ids.length; i++){
        let id = ids[i];
        let count = i + 1;

        Page.findById(id, function (err, page) {
            page.sorting = count;
            page.save(function (err) {
                if(err) return console.log(err);
                ++count;
                if( count >= ids.length){
                    cb();
                }
            });
        });
    }
}

// POST  reorder pages
router.post('/reorder-pages', function (req, res) {
    var ids = req.body['id[]'];
    sortPages(ids, function () {
        Page.find().sort({sorting: 1}).exec(function (err, pages) {
            if(err){
                return console.log(err);
            }else{
                req.app.locals.pages = pages;
            }
        });
    })
});


// GET edit pages
router.get('/edit-page/:id', function (req, res) {

    Page.findById(req.params.id, function (err, page) {
        if(err) return console.log(err);

        res.render('admin/pages/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    })
});

// POST edit pages
router.post('/edit-page/:id', function (req, res) {

    req.checkBody('title', 'Title must have value').not().isEmpty();
    req.checkBody('content', 'Content must have value').not().isEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;
    var id = req.params.id;
    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/pages/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({slug: slug, _id:{'$ne': id}},function (err, page) {
            if(page){
                req.flash('danger', 'Page slug is exists, choose another.');
                res.render('admin/pages/edit_page',{
                    title: title,
                    slug: slug,
                    content: content,
                    id:id
                });
            }else{
                Page.findById(id, function (err, page) {
                    if(err) return console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function(err){
                        if(err) return console.log(err);

                        Page.find().sort({sorting: 1}).exec(function (err, pages) {
                            if(err){
                                return console.log(err);
                            }else{
                                req.app.locals.pages = pages;
                            }
                        });

                        req.flash('success','Page updated!');
                        res.redirect('/admin/pages/edit-page/' + id);
                    })
                })
            }
        });
    }

});

// GET delete page
router.get('/delete-page/:id', function (req, res) {
    Page.findByIdAndRemove(req.params.id, function (err) {
        if(err) return console.log(err);

        Page.find().sort({sorting: 1}).exec(function (err, pages) {
            if(err){
                return console.log(err);
            }else{
                req.app.locals.pages = pages;
            }
        });

        req.flash('success','Page Deleted!');
        res.redirect('/admin/pages/');
    });
});

// Exports
module.exports = router;