var Gateway = require('../models/gateway_request');
var Customer = require('../models/customer');
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
                doc.request_info = req.body;

                if (customerInfo) {

                    result.customerInfo = customerInfo;
                    result.message = "proccessing your request";
                    doc.response_info = result;
                    doc.result = true;
                    doc.save();
                    var response = {"success": true, "result": result};
                    res.send(response)
                }
                else {
                    var errorResponse = {
                        "success": false,
                        "error": {"code": 102, "message": "Sorry,Tracing you... Run..."}
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



