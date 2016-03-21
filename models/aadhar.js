var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var validate = require('mongoose-validator');
var config = require('../configs/config');
var mobileNumberValidator = [
    validate({
        validator: 'isLength',
        arguments: [10, 10],
        message: 'Require 10 digit mobile number'
    }),
    validate({
        validator: 'isNumeric',
        message: 'Require only number'
    })
];
var aadharNumberValidator = [
    validate({
        validator: 'isLength',
        arguments: [12, 120],
        message: 'Require 12 digit Aadhar number'
    }),
    validate({
        validator: 'isNumeric',
        message: 'Require only number'
    })
];


var aadharSchema = new Schema({
    "phone": { type: String, required: true, validate: mobileNumberValidator, unique: true},
    "uid": { type: String, required: true, validate: aadharNumberValidator, unique: true},
    "first_name": {type: String, required: true},
    "last_name": {type: String, required: true},
    "dob": {type: String},
    "street": {type: String},
    "building":{type:String},
    "vtc": {type: String, required: true},
    "subdist": {type: String },
    "district": {type: String, required: true},
    "state": {type: String, required: true},
    "pincode": {type: String, required: true},
    "gender": {type: String, required: true},
    "email": {type: String, required: true, unique: true}

});

module.exports = mongoose.model('aadhar', aadharSchema);
