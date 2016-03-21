
// Load required packages
var mongoose = require('mongoose');
var random = require('random-js')();
var validate = require('mongoose-validator');

var Schema = mongoose.Schema;

var aadharNumberValidator = [
    validate({
        validator: 'isLength',
        arguments: [12,12],
        message: 'Require 12 digit addhar number'
    }),
    validate({
        validator: 'isNumeric',
        message: 'Require only number'
    })
];

var aadharVerificationSchema = new Schema({

    aadhar_number    : { type: String, required: true, validate: aadharNumberValidator},

    is_new    : {type: Boolean},

    verification_code : {type: String},

    created_date_time: {type: Date, default: Date.now},
    apiResponse :{type:String}
});


module.exports = mongoose.model('aadharVerification', aadharVerificationSchema);



