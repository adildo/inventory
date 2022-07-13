var mongoose = require('mongoose')

var Schema = mongoose.Schema

var ItemSchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100},
        description: { type: String, maxLength: 50},
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true},
        brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true},
        price: { type: Number, required: true, min: 0.5},
        stockQuantity: { type: Number, required: true, min: 0},
    }
)
ItemSchema.virtual('url').get(function () {
    return '/catalog/item/' + this._id
})

module.exports = mongoose.model('Item', ItemSchema)