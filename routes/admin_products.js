var express = require('express');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var router = express.Router();

//GET Product model
var Product = require('../models/product');

//GET Category model
var Category = require('../models/category');

// GET Product index
router.get('/', function (req, res) {
    var count;

    Product.count(function (err, c) {
        if(err) return console.log(err);

        count = c;
    });

    Product.find(function (err, products) {
        if(err) return console.log(err);

        res.render('admin/products/products',{
            products: products,
            count: count
        })
    });
});

// GET add Products
router.get('/add-product', function (req, res) {
    var title = '';
    var desc = '';
    var price = '';

    Category.find(function (err, categories) {
        res.render('admin/products/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });
});

// POST add Products
router.post('/add-product', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have value').not().isEmpty();
    req.checkBody('desc', 'Description must have value').not().isEmpty();
    req.checkBody('price', 'Price must have value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/products/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({slug: slug},function (err, product) {
            if(product){
                req.flash('danger', 'Product title is exists, choose another.');
                Category.find(function (err, categories) {
                    res.render('admin/products/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            }else{

                var priceFixed = parseFloat(price).toFixed(2);

                var productNew = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: priceFixed,
                    category: category,
                    image: imageFile
                });

                productNew.save(function(err){
                    if(err) return console.log(err);

                    mkdirp('public/product_images/' + productNew._id, function (err) {
                        if(err) return console.log(err);
                    });

                    mkdirp('public/product_images/' + productNew._id + '/gallery', function (err) {
                        if(err) return console.log(err);
                    });

                    mkdirp('public/product_images/' + productNew._id + '/gallery/thumbs', function (err) {
                        if(err) return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + productNew._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            if(err) return console.log(err);
                        })
                    }

                    req.flash('success','Product added!');
                    res.redirect('/admin/products');
                })
            }
        });
    }

});



// GET Edit Product
router.get('/edit-product/:id', function (req, res) {

    var errorsP;

    if(req.session.errors) errorsP = req.session.errors;
    req.session.errors = null;

    Category.find(function (err, categories) {

        Product.findById(req.params.id, function (err, product) {

            if(err){
                console.log(err);
                res.redirect('/admin/products');
            } else {

                var galleryDir = 'public/product_images/' + product._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir,function (err, files) {
                    if(err){
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/products/edit_product', {
                            errors: errorsP,
                            title: product.title,
                            desc: product.desc,
                            categories: categories,
                            category: product.category.replace(/\s+/g,'-').toLowerCase(),
                            price: parseFloat(product.price).toFixed(2),
                            image: product.image,
                            galleryImages: galleryImages,
                            id: product._id
                        });
                    }
                });
            }
        })
    });
});

// POST Edit Product
router.post('/edit-product/:id', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have value').not().isEmpty();
    req.checkBody('desc', 'Description must have value').not().isEmpty();
    req.checkBody('price', 'Price must have value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pImage = req.body.pImage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else{
        Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, product) {
            if(err) return console.log(err);

            if(product){
                req.flash('danger', 'Product title is exists, choose another');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, pNew) {
                    if(err) return console.log(err);

                    pNew.title = title;
                    pNew.slug = slug;
                    pNew.desc = desc;
                    pNew.price = parseFloat(price).toFixed(2);
                    pNew.category = category;
                    pNew.title = title;

                    if(imageFile != ""){
                        pNew.image = imageFile;
                    }

                    pNew.save(function (err) {
                        if(err) return console.log(err);

                        if(imageFile != ""){
                            if(pImage != "") {
                                fs.remove('public/product_images/' + id + '/' + pImage, function (err) {

                                    if(err) return console.log(err);
                                });
                            }
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                if(err) return console.log(err);
                            })
                        }

                        req.flash('success','Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });
                });
            }
        });
    }
});

// POST product gallery
router.post('/product-gallery/:id', function (req, res) {

    let timestamp = Math.round(+new Date()/1000);//get timestamp
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + timestamp + '_' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + timestamp + '_'+ req.files.file.name;

        productImage.mv(path,function (err) {

            if(err) return console.log(err);

            resizeImg(fs.readFileSync(path),{width: 100, height: 100}).then(function (buf) {
                fs.writeFileSync(thumbsPath, buf);
            });
        });

        res.sendStatus(200);


});

// GET delete image
router.get('/delete-image/:image', function (req, res) {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {

        if(err){
            return console.log(err);
        }else {
            fs.remove(thumbImage,function (err) {
                if(err){
                    return console.log(err);
                }else{
                    req.flash('success','Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });

});

// GET delete product
router.get('/delete-product/:id', function (req, res) {

    var id = req.params.id;
    path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if(err){
            return console.log(err);
        }else {
            Product.findByIdAndRemove(id, function (err) {
                if(err) return console.log(err);

                req.flash('success','Product Deleted!');
                res.redirect('/admin/products');
            });
        }
    });
});

// Exports
module.exports = router;