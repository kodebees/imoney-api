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
        arguments: [12, 12],
        message: 'Require 10 digit Aadhar number'
    }),
    validate({
        validator: 'isNumeric',
        message: 'Require only number'
    })
];


var customerSchema = new Schema({
    "mobile_number": { type: String, required: true, validate: mobileNumberValidator, unique: true},
    "aadhar_number": { type: String, required: true, validate: aadharNumberValidator, unique: true},
    "first_name": {type: String, required: true},
    "last_name": {type: String, required: true},
    "dob": {type: String},
    "is_phone_verified":{type:Boolean,default:false},
    "is_email_verified":{type:Boolean,default:false},
    "address": {
        "street": {type: String, required: true},
        "vtc": {type: String, required: true},
        "subdist": {type: String, required: true},
        "district": {type: String, required: true},
        "state": {type: String, required: true},
        "pincode": {type: String, required: true}
    },
    "gender": {},
    "email": {type: String, required: true, unique: true},
    "deviceInfo": {
        model: {type: String},
        platform: {type: String},
        uuid: {type: String},
        version: {type: String},
        push_token: {type: String},
        imei: {type: String}
    },
    "ip_address" : {type:String},
    "application_version": {type: String},
    "wallet": {
        id: {type: String},
        created_datetime: {type: Date},
        updated_datetime: {type: Date},
        token: {type: String},
        balance: {type: Number,default:0}
    },
    "transactions": [
        {transaction_type: {type: String}, //debit,credit
            description: {type: String},
            amount: {type: Number},
            created_datetime: {type: Date}
        }
    ],

    "locker_amount": {type: Number,default:0}
})

module.exports = mongoose.model('customer', customerSchema);
