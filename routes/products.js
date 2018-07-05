var express = require ('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;

//GET Product model
var Product = require('../models/product');

//GET Category model
var Category = require('../models/category');

// Get all Product
router.get('/', isUser, function (req, res) {

    Product.find(function (err, products) {
        if(err) return console.log(err);

        res.render('all_products',{
            title: 'All Products',
            products: products
        });
    });
});

// Get Product By Category
router.get('/:category',function (req, res) {

    let categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, function (err, c) {
        Product.find({category: categorySlug},function (err, products) {
            if(err) return console.log(err);

            res.render('cat_products',{
                title: c.title,
                products: products
            });
        });
    });
});

// Get Product Detail
router.get('/:category/:product',function (req, res) {

    let galleryImages = null;

    Product.findOne({slug: req.params.product}, function (err, product) {
        if(err){
            return console.log(err);
        }else{
            let galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if(err) {
                    return console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product',{
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages
                    });
                }
            });
        }
    });
});

// Exports
module.exports = router;