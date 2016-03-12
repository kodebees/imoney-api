/**
/**
 * Created by Dhamayanthi on 05/01/15.
 */

// Load required packages
var mongoose = require('mongoose');
var Device = require('../models/device');
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
    var self=this;

    Device.findOne({mobile_number: this.mobile_number}, function (error, mobileNumber) {
        if(error)
        {
            console.log("error"+error);
            var err = new Error();
            err.status = 101; //undefined
            err.message =error;
            next(err);
        }
       else if(mobileNumber)
        {
            console.log("Mobile Number "+mobileNumber.mobile_number +" Already registered in server ")
            self.is_new=false;
            next();
        }
        else
       {
           self.is_new=true;
           next();
       }

    });


});

module.exports = mongoose.model('mobileVerification', mobileVerificationSchema);



