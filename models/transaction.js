var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var config = require('../configs/config');

var transactionSchema = new Schema({
	account_id :{type:ObjectId, ref : 'Account'},	
	transaction_type:{type:String}, //debit,credit
	description:{type:String},
	amount:{type:number},
	refere

})

module.exports = mongoose.model('transaction', transactionSchema);


