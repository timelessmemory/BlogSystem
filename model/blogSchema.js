var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    user:String,
    subDate:String,
    title: String,
    contents: String
});

module.exports = mongoose.model('blogContents', blogSchema);
