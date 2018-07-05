var express = require ('express');
var router = express.Router();

//GET Page model
var Product = require('../models/product')

// GET Add product to cart
router.get('/add/:product',function (req, res) {

    let slug = req.params.product;

    Product.findOne({slug: slug}, function (err, p) {

        if(err) return console.log(err);

        if(typeof req.session.cart == "undefined"){

            req.session.cart = [];
            req.session.cart.push({
               title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p.id + '/' + p.image
            });
        } else {

            let cart = req.session.cart;
            let newItem = true;

            for( let i = 0; i < cart.length; i++){

                if(cart[i].title == slug){
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if(newItem){

                req.session.cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p.id + '/' + p.image
                });
            }
        }

        req.flash('success', 'Product added');
        res.redirect('back');
    });
});

// Get Checkout page
router.get('/checkout',function (req, res) {

    if(req.session.cart && req.session.cart.length == 0){
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }
});

// Get Update Product
router.get('/update/:product',function (req, res) {

    let slug = req.params.product,
        cart = req.session.cart,
        action = req.query.action;

    for (let i = 0; i < cart.length; i++ ){
        if(cart[i].title == slug ){
            switch (action){
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if(cart[i].qty < 1) cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if(cart.length == 0) delete req.session.cart;
                    break;
                default:
                    console.log("update problem");
                    break;
            }
        }
    }

    req.flash('success', 'Cart updated');
    res.redirect('/cart/checkout');
});

// Get clear cart
router.get('/clear',function (req, res) {

    delete req.session.cart;

    req.flash('success', 'Cart cleared');
    res.redirect('/cart/checkout');
});

// Exports
module.exports = router;