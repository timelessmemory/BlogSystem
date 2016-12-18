/**
 * Created by Timeless on 2015/3/27.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    password: String
});

//mongoose.model(modelName, schema)
module.exports = mongoose.model('users', userSchema);
