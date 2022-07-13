const Brand = require('../models/brand');
var Category = require('../models/category');
const Item = require('../models/item')

var async = require('async');
const { body,validationResult } = require("express-validator");
const { create } = require('../models/item');
const category = require('../models/category');

// Display list of all category.
exports.category_list = function(req, res) {
    Category.find({}, 'name')
    .sort({name: 1})
    .exec(function(err, category_list){
        if (err) {return next(err)}
        res.render('category_list', {title: "Category List", category_list: category_list})
    })
};

// Display detail page for a specific category.
exports.category_detail = function(req, res, next) {
    async.parallel({
        items_category: function(callback) {
            Item.find({'category': req.params.id})
            .exec(callback)
        },
        category: function(callback) {
            Category.findById(req.params.id)
            .exec(callback)
        }
    }, function(err, results) {
        if (err) {return next(err)}
        if (results.category === null) {
            const err = new Error('Category not found')
            err.status = 404;
            return next(err)
        }
        res.render('category_detail', {title: results.category, category_items: results.items_category })
    })
};

// Display category create form on GET.
exports.category_create_get = function(req, res) {
    res.render('category_form', {title: 'Create a new category'})
};

// Handle category create on POST.
exports.category_create_post = [
    body('name', 'Category name is required').trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        const category = new Category(
            {name: req.body.name}
        )
        if (!errors.isEmpty()) {
            res.render('category_form', {title: 'Create new Category', category: category, errors: errors.array() })
            return 
        }
        else {
            Category.findOne({'name': req.body.name}).exec(function(err, found_category) {
                if (err) {return next(err)}
                if (found_category) {
                    res.redirect(found_category.url)
                }
                else {
                    category.save(function(err) {
                        if (err) { return next(err) }
                        res.redirect(category.url)
                    })
                }
            })
        }
    }
]

// Display category delete form on GET.
exports.category_delete_get = function(req, res, next) {
    async.parallel({
        items: function(callback) {
            Item.find({"category": req.params.id}).exec(callback)
        },
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        }
    }, function(err, results) {
        if (err) {return next(err)}
        if (results.category==null) {
            res.redirect('/catalog/categories')
        }
        res.render('category_delete', {title: "Delete Category", category_items: results.items, category: results.category})
    })
};

// Handle category delete on POST.
exports.category_delete_post = function(req, res, next) {
    async.parallel({
        items: function(callback) {
            Item.find({'category': req.params.id}).exec(callback)
        },
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err)}
        if (results.items.length > 0) {
            res.render('category_delete', {title: "Delete Category", category_items: results.items, category: results.category})
            return
        }
        else {
            Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(err) {
                if (err) { return next(err)}
                res.redirect('/catalog/categories')
            })
        }
    })


};

// Display category update form on GET.
exports.category_update_get = function(req, res) {
    Category.findById(req.params.id).exec(function (err, category) {
        if (err) {return next(err)}
        if (category == null) {
            let err = new Error('This category does not exists')
            err.status = 404
            return next(err)
        }
        res.render('category_form', {title: 'Update category', category: category})
    })};

// Handle category update on POST.
exports.category_update_post = [
    body('name', 'Category name is required').trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        const category = new Category(
            {
                name: req.body.name,
                _id: req.params.id
            }
        )
        if (!errors.isEmpty()) {
             res.render('category_form', {title: 'Update category', category: category, errors: errors.array()})
             return
        }
        else {
            Category.findByIdAndUpdate(req.params.id, category, {}, function(err, thecategory) {
                if (err) { return next(err) }
                res.redirect(thecategory.url)
            })
        }
    }
]
