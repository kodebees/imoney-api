
// Load required packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gatewayRequestSchema = new Schema({

    gateway_number    : { type: String, required: true},
    request_mobile_number : {type:String,required:true},
    request_info    : {},
    response_info : {},
    result:{type:Boolean},
    created_date_time: {type: Date, default: Date.now}

});


module.exports = mongoose.model('gatewayRequest', gatewayRequestSchema);



