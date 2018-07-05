var express = require('express');
var router = express.Router();

//GET Category model
var Category = require('../models/category');

// GET Category index
router.get('/', function (req, res) {
    Category.find(function (err, categories) {
        if(err) return console.log(err);

        res.render('admin/categories/categories',{
            categories: categories
        })
    });
});

// GET add category
router.get('/add-category', function (req, res) {
    var title = '';

    res.render('admin/categories/add_category', {
        title: title,
    });
});

// POST add category
router.post('/add-category', function (req, res) {

    req.checkBody('title', 'Title must have value').not().isEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/categories/add_category', {
            errors: errors,
            title: title,
        });
    } else {
        Category.findOne({slug: slug},function (err, category) {
            if(category){
                req.flash('danger', 'Category title is exists, choose another.');
                res.render('admin/categories/add_category',{
                    title: title
                });
            }else{
                var categoryNew = new Category({
                    title: title,
                    slug: slug
                });

                categoryNew.save(function(err){
                    if(err) return console.log(err);

                    // Get all categories to pass to header.ejs
                    Category.find(function (err, categories) {
                        if(err){
                            return console.log(err);
                        }else{
                            req.app.locals.categories = categories;
                        }
                    });

                    req.flash('success','Category added!');
                    res.redirect('/admin/categories');
                })
            }
        });
    }

});


// GET edit categories
router.get('/edit-category/:id', function (req, res) {
    Category.findById(req.params.id, function (err, category) {
        if(err) return console.log(err);

        res.render('admin/categories/edit_category', {
            title: category.title,
            id: category._id
        });
    })
});

// POST edit categories
router.post('/edit-category/:id', function (req, res) {

    req.checkBody('title', 'Title must have value').not().isEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;
    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/categories/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({slug: slug, _id:{'$ne': id}},function (err, category) {
            if(category){
                req.flash('danger', 'Category title is exists, choose another.');
                res.render('admin/categories/edit_category',{
                    title: title,
                    id:id
                });
            }else{
                Category.findById(id, function (err, category) {
                    if(err) return console.log(err);

                    category.title = title;
                    category.slug = slug;

                    category.save(function(err){
                        if(err) return console.log(err);

                        // Get all categories to pass to header.ejs
                        Category.find(function (err, categories) {
                            if(err){
                                return console.log(err);
                            }else{
                                req.app.locals.categories = categories;
                            }
                        });

                        req.flash('success','Category updated!');
                        res.redirect('/admin/categories/edit-category/' + id);
                    })
                })
            }
        });
    }

});

// GET delete page
router.get('/delete-category/:id', function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err) {
        if(err) return console.log(err);

        // Get all categories to pass to header.ejs
        Category.find(function (err, categories) {
            if(err){
                return console.log(err);
            }else{
                req.app.locals.categories = categories;
            }
        });

        req.flash('success','Category Deleted!');
        res.redirect('/admin/categories/');
    });
});

// Exports
module.exports = router;