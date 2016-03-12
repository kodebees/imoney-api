var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var validate = require('mongoose-validator');
var config = require('../configs/config');
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
var aadharNumberValidator = [
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


var customerSchema = new Schema({
	"mobile_number":{ type: String, required: true, validate: mobileNumberValidator,unique:true},
	"aadhar_number":{ type: String, required: true, validate: aadharNumberValidator,unique:true},
	"first_name":{type:String,required:true},
	"last_name":{type:String,required:true},
	"dob":{type:Date},
	"address":{},
	"gender":{},
	"email":{type:String,required:true,unique:true},
	"device":{
		 model: {type: String, required: true},
         platform: {type: String, required: true},
         uuid: {type: String, required: true},
         version: {type: String, required: true},
         gcm_id: {type: String},
         imei:{type:String}
	},
	"wallet":{
		id:{type:number},
		created_datetime:{type:Date},
		token:{type:String},
		balance:{type:number}
	},
	
