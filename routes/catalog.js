var express = require('express');
var router = express.Router();

var brand_controller = require('../Controllers/brandController')
var item_controller = require('../Controllers/itemController')
var category_controller = require('../Controllers/categoryController');

router.get('/', item_controller.index)

//item Routes

router.get('/item/create', item_controller.item_create_get)

router.post('/item/create', item_controller.item_create_post)

router.get('/item/:id/delete', item_controller.item_delete_get)

router.post('/item/:id/delete', item_controller.item_delete_post)

router.get('/item/:id/update', item_controller.item_update_get)

router.post('/item/:id/update', item_controller.item_update_post)

router.get('/item/:id', item_controller.item_detail)

router.get('/items', item_controller.item_list)

// Brand Routes

router.get('/brand/create', brand_controller.brand_create_get);

router.post('/brand/create', brand_controller.brand_create_post);

router.get('/brand/:id/delete', brand_controller.brand_delete_get);

router.post('/brand/:id/delete', brand_controller.brand_delete_post);

router.get('/brand/:id/update', brand_controller.brand_update_get);

router.post('/brand/:id/update', brand_controller.brand_update_post);

router.get('/brand/:id', brand_controller.brand_detail);

router.get('/brands', brand_controller.brand_list);

// Category Routes

router.get('/category/create', category_controller.category_create_get);

router.post('/category/create', category_controller.category_create_post);

router.get('/category/:id/delete', category_controller.category_delete_get);

router.post('/category/:id/delete', category_controller.category_delete_post);

router.get('/category/:id/update', category_controller.category_update_get);

router.post('/category/:id/update', category_controller.category_update_post);

router.get('/category/:id', category_controller.category_detail);

router.get('/categories', category_controller.category_list);

module.exports = router;