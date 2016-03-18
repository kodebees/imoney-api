
// Load required packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var REQUEST_INDEX ={
    TYPE:0
};
var SPLIT_CHAR = '~';
var gatewayRequestSchema = new Schema({

    gateway_number    : { type: String, required: true},
    request_mobile_number : {type:String,required:true},
    request_info    : {},
    response_info : {},
    result:{type:Boolean},
    created_date_time: {type: Date, default: Date.now}

},{
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});
gatewayRequestSchema.virtual('request_type')
    .get(function () {
        console.log(this.request_info);
        var requestInfo = this.request_info.toString();
        if(requestInfo.indexOf(SPLIT_CHAR) > -1) {
            var request = requestInfo.split(SPLIT_CHAR)
            console.log(request);

            if(request.length >= REQUEST_INDEX.TYPE)
            {
                return  request[REQUEST_INDEX.TYPE];
            }


        }
        return requestInfo;
    })

module.exports = mongoose.model('gatewayRequest', gatewayRequestSchema);



