var mongoose = require('mongoose')

var Schema = mongoose.Schema

var BrandSchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 50},
        description: { type: String, maxLength: 150}
    }
)
BrandSchema.virtual('url').get(function () {
    return '/catalog/brand/' + this._id
})

module.exports = mongoose.model('Brand', BrandSchema)