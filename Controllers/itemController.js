var Item = require('../models/item')
var Brand = require('../models/brand')
var Category = require('../models/category')

const { body, validationResult } = require("express-validator");
var async = require('async');
const { countDocuments } = require('../models/item');
const item = require('../models/item');

exports.index = function(req, res, next) {
    async.parallel({
        item_count: function(callback) {
            Item.countDocuments({}, callback)
        }, 
        brand_count: function(callback) {
            Brand.countDocuments({}, callback)
        },
        category_count: function(callback) {
            Category.countDocuments({}, callback)
        }
    }, function(err, results) {
        res.render('index', {title: "Inventory Index", error: err, data: results})
    })
};

// Display list of all items.
exports.item_list = function(req, res, next) {
    Item.find({}, 'name stockQuantity')
    .sort({name: 1})
    .exec(function(err, item_list) {
        if (err) {return next(err)}
        res.render('item_list', { title: 'Item List', list_item: item_list})
    });
};

// Display detail page for a specific item.
exports.item_detail = function(req, res) {
    Item.findById(req.params.id).populate('brand').populate('category').exec(function(err, item) {
        res.render('item_detail', {title: 'Inventory Item', error: err, item: item})
    })
};

// Display item create form on GET.
exports.item_create_get = function(req, res, next) {
    async.parallel({
        categories: function(callback) {
            Category.find().exec(callback)
        },
        brands: function(callback) {
            Brand.find(callback)
        }
    }, function(err, results) {
        if (err) {return next(err)}
        res.render('item_form', {title: 'Create new Item', categories: results.categories, brands: results.brands})
    })
};

// Handle item create on POST.
exports.item_create_post = [
    body('name', 'Item name is required').trim().isLength({min: 1}).escape(), 
    // body('description').optional({ checkFalsy: true }).trim().escape(),
    body('category.*').escape(),
    body('brand.*').escape(),
    body('price').trim().not().isEmpty().withMessage('please enter a number').isNumeric().withMessage('Please enter a valid number'),
    (req, res, next) => {
        const errors = validationResult(req)
        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            brand: req.body.brand, 
            price: req.body.price,
            stockQuantity: req.body.stockQuantity
        })
        if (!errors.isEmpty()){
            async.parallel({
                categories: function(callback) {
                    Category.find().exec(callback)
                },
                brands: function(callback) {
                    Brand.find(callback)
                }
            }, function(err, results) {
                if (err) { return next(err)}
                res.render('item_form', {title: "Create new Item", categories: results.categories, brands: results.brands, item: item, errors: errors.array()})
            })
            return
        }
        else {
            item.save(function(err) {
                if (err) {return next(err)}
                res.redirect(item.url)
            })
        }
    }
]


// Display item delete form on GET.
exports.item_delete_get = function(req, res, next) {
    Item.findById(req.params.id).exec(function(err, item) {
        res.render('item_delete', {title: 'Delete Item', item: item, error: err})
    })
};

// Handle item delete on POST.
exports.item_delete_post = function(req, res, next) {
    Item.findByIdAndRemove(req.body.itemid, function deleteItem(err) {
        if (err) {return next(err)}
        res.redirect('/catalog/items')
    })
        
};
	
// Display item update form on GET.
exports.item_update_get = function(req, res, next) {
    async.parallel({
        brands: function(callback) {
            Brand.find().exec(callback)
        },
        categories: function(callback) {
            Category.find().exec(callback)
        },
        item: function(callback) {
            Item.findById(req.params.id).populate('brand').populate('category').exec(callback)
        }
    }, function(err, results) {
        if (err) {return next(err)}
        if (results.item == null) {
            let err = new Error('this item does not exists')
            err.status = 404
            return next(err)

        }
        res.render('item_form', {title: 'Update item', item: results.item, categories: results.categories, brands: results.brands})
        // return 
    })
};

// Handle item update on POST.
exports.item_update_post = [
    
    body('name', 'Item name is required').trim().isLength({min: 1}).escape(), 
    // body('description').optional({ checkFalsy: true }).trim().escape(),
    body('category.*').escape(),
    body('brand.*').escape(),
    body('price').trim().not().isEmpty().withMessage('please enter a number').isNumeric().withMessage('Please enter a valid number'),
    (req, res, next) => {
        const errors = validationResult(req)

        let item = new Item(
            {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                brand: req.body.brand, 
                price: req.body.price,
                stockQuantity: req.body.stockQuantity,
                _id: req.params.id
            }
        )
        if (!errors.isEmpty()) {
            async.parallel({
                brands: function(callback) {
                    Brand.find().exec(callback)
                },
                categories: function(callback) {
                    Category.find().exec(callback)
                }
            }, function(err, results) {
                if (err) {return next(err)}
                if (item == null) {
                    let err = new Error('this item does not exists')
                    err.status = 404
                    return next(err)
                }
                res.render('item_form', {title: 'Update item', categories: results.categories, brands: results.brands, item: item})
                // return 
            })
        }
        else {
            Item.findByIdAndUpdate(req.params.id, item, {}, function (err, theitem) {
                if (err) {return next(err)}
                res.redirect(theitem.url)
            })
        }
    }
]
