var Gateway = require('../models/gateway_request');
var Customer = require('../models/customer');
var Config = require('../configs/config');
exports.processRequest = function (req, res) {
    console.log("Sms gateway request");
    new Gateway(req.body).save(function (err, doc) {
        if (err) {
            var errMessage = [];

            // go through all the errors...
            for (var errName in err.errors) {
                var message = err.errors[errName].message
                var errors = {};
                errors[errName] = message
                errMessage.push(errors);
            }
            console.log(err);
            var errorResponse = {"success": false, "error": {"code": 102, "message": errMessage}};//validation error
            res.send(errorResponse);
            return;
        }


        if (!doc) {

            return res.send({message: "check parameters"});

        }
        else {
            var result = {};

            //check if customer already exist in our system
            Customer.findOne({mobile_number: doc.request_mobile_number}, function (error, customerInfo) {
                doc.request_info = req.body.request_info;


                if (customerInfo) {


                    result.message = "proccessing your request";
                    console.log(doc.request_type);
                    switch (doc.request_type){
                        case Config.SMS_ROUTE.GET_BALANCE:
                            console.log("proccesing your balance");
                            result.message = "balance"+Config.SPLIT_CHAR+customerInfo.wallet.balance+Config.SPLIT_CHAR+customerInfo.locker_amount;
                            result.mobile_number = customerInfo.mobile_number;
                            break;
                        case Config.SMS_ROUTE.TRANSFER:
                            console.log("Processing your transfer");
                            break;
                        default :
                            console.log("NO Request type found");
                            break;

                    }
                    doc.response_info = result;
                    doc.result = true;
                    doc.save();
                    var response = {"success": true, "result": result};
                    res.send(response)
                }
                else {
                    var errorResponse = {
                        "success": false,
                        "error": {"code": 102, "message": "Download Imoney, Get better Response"}
                    };
                    doc.response_info = errorResponse;
                    doc.result = false;
                    doc.save();
                    res.send(errorResponse);
                    return;
                }
            });
        }
    });
}



