
// Load required packages
var mongoose = require('mongoose');
var random = require('random-js')();


var Schema = mongoose.Schema;



var redeemSchema = new Schema({

    mobile_number    : { type: String, required: true},
    status    : {type: Number,default:0}, //0-witdraw from wallet 1->withdraw as cash
    amount :{type:Number},
    mcode : {type: String},
    created_date_time: {type: Date, default: Date.now},
    withdraw_date_time:{type: Date}

});

redeemSchema.pre('save', function(next) {

    var genCode = "ICICI-"+random.integer(1000,9999);
    console.log("Genreated mcode is "+genCode);
    this.mcode = genCode;
    next();


});

module.exports = mongoose.model('redeem', redeemSchema);



