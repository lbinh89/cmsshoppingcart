var express = require ('express');
var router = express.Router();

//GET Page model
var Page = require('../models/page')


// Get Home
router.get('/',function (req, res) {

    Page.findOne({slug: 'home'}, function (err, page) {
        if(err) return console.log(err);

        res.render('index',{
            title: page.title,
            content: page.content
        });
    });
});

// Get Page
router.get('/:slug',function (req, res) {

    let slug = req.params.slug;

    Page.findOne({slug: slug}, function (err, page) {
        if(err) return console.log(err);

        if(!page){
            res.redirect('/');
        }else{
            res.render('index',{
                title: page.title,
                content: page.content
            });
        }
    });
});


// Exports
module.exports = router;