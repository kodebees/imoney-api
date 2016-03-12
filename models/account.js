var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var config = require('../configs/config');

var accountSchema = new Schema({
	customer_id :{type:ObjectId, ref : 'Customer'},
	account_type :{type:String},
	description:{type:String}

});
module.exports = mongoose.model('account', accountSchema);