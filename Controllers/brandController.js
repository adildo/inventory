var Brand = require('../models/brand');
const Item = require('../models/item')

const async = require('async')
const { body,validationResult } = require("express-validator");

// Display list of all brand.
exports.brand_list = function(req, res, next) {
    Brand.find({}, 'name description')
    .sort({name: 1})
    .exec(function(err, brand_list){
        if (err) {return next(err)}
        res.render('brand_list', {title: "Brand List", brand_list: brand_list})
    })
};

// Display detail page for a specific brand.
exports.brand_detail = function(req, res, next) {
    async.parallel({
        items_brand: function(callback) {
            Item.find({'brand': req.params.id})
            .exec(callback)
        },
        brand: function(callback) {
            Brand.findById(req.params.id)
            .exec(callback)
        }
    }, function(err, results) {
        if (err) {return next(err)}
        if (results.brand === null) {
            const err = new Error('Brand not found')
            err.status = 404;
            return next(err)
        }
        res.render('brand_detail', {title: results.brand, brand_items: results.items_brand })
    })
};

// Display brand create form on GET.
exports.brand_create_get = function(req, res) {
    res.render('brand_form', {title: 'Create a new brand'})
};

// Handle brand create on POST.
exports.brand_create_post = [
    body('name', 'Brand name is required').trim().isLength({min: 1}).escape(),
    body('description').optional({ checkFalsy: true }).trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        const brand = new Brand(
            {
                name: req.body.name,
                description: req.body.description
            }
        )
        if (!errors.isEmpty()) {
            res.render('brand_form', {title: 'Create new Brand', brand: brand, errors: errors.array() })
            return 
        }
        else {
            Brand.findOne({'name': req.body.name}).exec(function(err, found_brand) {
                if (err) {return next(err)}
                if (found_brand) {
                    res.redirect(found_brand.url)
                }
                else {
                    brand.save(function(err) {
                        if (err) { return next(err) }
                        res.redirect(brand.url)
                    })
                }
            })
        }
    }
]
;

// Display brand delete form on GET.
exports.brand_delete_get = function(req, res, next) {
    async.parallel({
        items: function(callback) {
            Item.find({"brand": req.params.id}).exec(callback)
        },
        brand: function(callback) {
            Brand.findById(req.params.id).exec(callback)
        }
    }, function(err, results) {
        if (err) {return next(err)}
        if (results.brand==null) {
            res.redirect('/catalog/brands')
        }
        res.render('brand_delete', {title: "Delete Brand", brand_items: results.items, brand: results.brand})
    })
};

// Handle brand delete on POST.
exports.brand_delete_post = function(req, res) {
    async.parallel({
        items: function(callback) {
            Item.find({'brand': req.params.id}).exec(callback)
        },
        brand: function(callback) {
            Brand.findById(req.params.id).exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err)}
        if (results.items.length > 0) {
            res.render('brand_delete', {title: "Delete Brand", brand_items: results.items, brand: results.brand})
            return
        }
        else {
            Brand.findByIdAndRemove(req.body.brandid, function deleteBrand(err) {
                if (err) { return next(err)}
                res.redirect('/catalog/brands')
            })
        }
    })
};

// Display brand update form on GET.
exports.brand_update_get = function(req, res, next) {
    Brand.findById(req.params.id).exec(function (err, brand) {
        if (err) {return next(err)}
        if (brand == null) {
            let err = new Error('This brand does not exists')
            err.status = 404
            return next(err)
        }
        res.render('brand_form', {title: 'Update brand', brand: brand})
    })
};

// Handle brand update on POST.
exports.brand_update_post = [
    body('name', 'Brand name is required').trim().isLength({min: 1}).escape(),
    body('description').optional({ checkFalsy: true }).trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        const brand = new Brand(
            {
                name: req.body.name,
                description: req.body.description,
                _id: req.params.id
            }
        )
        if (!errors.isEmpty()) {
            res.render('brand_form', {title: 'Update brand', brand: brand, errors: errors.array()})
            return
        }
        else {
            Brand.findByIdAndUpdate(req.params.id, brand, {}, function(err, thebrand) {
                if (err) { return next(err) }
                res.redirect(thebrand.url)
            })
        }
    }
]
