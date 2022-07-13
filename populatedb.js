#! /usr/bin/env node

console.log('This script populates some test items, brands, and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')
var Brand = require('./models/brand')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var brands = []
var categories = []

function itemCreate(name, description, category, brand, price, stockQuantity, cb) {
  itemdetail = {name:name , category: category, price: price, stockQuantity: stockQuantity, brand: brand }
  if (description != false) itemdetail.description = description
  
  var item = new Item(itemdetail);
       
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}

function brandCreate(name, description, cb) {
  let branddetail = { name:name }
  if (description != false) branddetail.description = description
  
  var brand = new Brand(branddetail);
       
  brand.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Brand: ' + brand);
    brands.push(brand)
    cb(null, brand);
  }   );
}

function categoryCreate(name, cb) {
    
    var category = new Category({ name: name });
         
    category.save(function (err) {
      if (err) {
        cb(err, null);
        return;
      }
      console.log('New Category: ' + category);
      categories.push(category)
      cb(null, category);
    }   );
  }

function createBrandsCategory(cb) {
    async.series([
        function(callback) {
          brandCreate('Nike', 'Just Do it', callback);
        },
        function(callback) {
          brandCreate('Head', false, callback);
        },
        function(callback) {
          brandCreate('Adidas', 'Impossible Is Nothing', callback);
        },
        function(callback) {
          brandCreate('Babolat', 'we live for this', callback);
        },
        function(callback) {
          brandCreate('Yonex', false, callback);
        },
        function(callback) {
          categoryCreate("Apparel", callback);
        },
        function(callback) {
          categoryCreate("Shoes", callback);
        },
        function(callback) {
          categoryCreate("Rackets", callback);
        },
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Babolat Pure Aero Rafa Tennis Racquet', 'Pro Racket', categories[2], brands[3], 259, 6, callback);
        },
        function(callback) {
            itemCreate('Head Auxetic Prestige MP 2021 Tennis Racquet', 'Pro Racket', categories[2], brands[1], 249, 3, callback);
          },
        function(callback) {
            itemCreate('Yonex Junior 25 Prestrung Sky Blue Tennis Racquet', 'Kids Racket', categories[2], brands[4], 41, 5, callback);
          },
        function(callback) {
            itemCreate('Nike React Vapor NXT Tennis Shoes Blue Chill and Midnight Navy', 'Men\'s', categories[1], brands[0], 160, 0, callback);
          },
        function(callback) {
            itemCreate('Head  Sprint Pro 3.0 SuperFabric Tennis Shoes Black and Lime', 'Women\'s', categories[1], brands[1], 145, 1, callback);
          },
        function(callback) {
            itemCreate('Nike Court Dri-FIT Advantage 7 Inch Tennis Shorts', 'Men\'s', categories[0], brands[0], 35, 2, callback);
          },
        function(callback) {
            itemCreate('Yonex Unisex Tennis Visor', 'Unisex', categories[0], brands[4], 259, 6, callback);
          }
        ],
        // optional callback
        cb);
}

async.series([
    createBrandsCategory,
    createItems,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // else {
    //     console.log('BOOKInstances: '+ bookinstances);
        
    // }
    // All done, disconnect from database
    mongoose.connection.close();
});



