/**
/**
 * Created by Dhamayanthi on 05/01/15.
 */

// Load required packages
var mongoose = require('mongoose');
var random = require('random-js')();
var validate = require('mongoose-validator');


var Schema = mongoose.Schema;

var mobileNumberValidator = [
    validate({
        validator: 'isLength',
        arguments: [10,10],
        message: 'Require 10 digit mobile number'
    }),
    validate({
        validator: 'isNumeric',
        message: 'Require only number'
    })
];

var mobileVerificationSchema = new Schema({

    mobile_number    : { type: String, required: true, validate: mobileNumberValidator},

    is_new    : {type: Boolean},

    verification_code : {type: String},

    created_date_time: {type: Date, default: Date.now},
    apiResponse :{type:String}
});

mobileVerificationSchema.pre('save', function(next) {

    var genCode = random.integer(1000,9999);
    console.log("Genreated code is "+genCode);
    this.verification_code = genCode;
    next();
      


});

module.exports = mongoose.model('mobileVerification', mobileVerificationSchema);



