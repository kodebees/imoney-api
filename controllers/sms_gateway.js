var Gateway = require('../models/gateway_request');
var Customer = require('../models/customer');
var Config = require('../configs/config');
var transactionController = require('./transaction');
var commonController = require('./common');
var gcm = require('node-gcm');
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
                            result.message = "balance"+Config.SPLIT_CHAR+customerInfo.wallet.virtual_balance+Config.SPLIT_CHAR+customerInfo.locker_amount;
                            result.mobile_number = customerInfo.mobile_number;
                            doc.response_info = result;
                            doc.result = true;
                            doc.save();
                            var response = {"success": true, "result": result};
                            res.send(response);
                            break;
                        case Config.SMS_ROUTE.TRANSFER:
                            console.log("Processing your transfer");
                            var transactionDetails = {};
                            //Todo check for valid amount to credit;
                            transactionDetails.amount = doc.amount;
                            var walletBalance = customerInfo.wallet.balance;
                            var lockerAmount = customerInfo.locker_amount;
                            var liquidBalance = walletBalance - lockerAmount;

                            if (liquidBalance >  doc.amount)
                            {
                                transactionDetails.sender_id = customerInfo._id;
                                transactionDetails.receiver_id = doc.receiver_id;
                                //Todo check is phone number verified or not
                                commonController.getCustomerInfo(doc.receiver_id,function(receiver){
                                    transactionDetails.name =receiver.full_name;
                                    transactionController.smsTransfer(transactionDetails,function(transaction_result){
                                        console.log(result);
                                        result.message="transfer"+Config.SPLIT_CHAR+"true"+Config.SPLIT_CHAR+transaction_result.balance+"~"+transaction_result.locker_amount;

                                        doc.response_info = result;
                                        doc.result = true;
                                        doc.save();
                                        var response = {"success": true, "result": result};
                                        res.send(response)
                                    },function(error){

                                        result.message="transfer"+Config.SPLIT_CHAR+"false"+Config.SPLIT_CHAR+"Failure";
                                        doc.response_info = result;
                                        doc.result = true;
                                        doc.save();
                                        var response = {"success": true, "result": result};
                                        res.send(response)
                                    })

                                },function(error){
                                    result.message="transfer"+Config.SPLIT_CHAR+"false"+Config.SPLIT_CHAR+"No receiver found";

                                    doc.response_info = result;
                                    doc.result = false;
                                    doc.save();
                                    var response = {"success": true, "result": result};
                                    res.send(response)
                                })
                            }
                            else {

                                result.message="transfer"+Config.SPLIT_CHAR+"false"+Config.SPLIT_CHAR+"No sufficient fund to transfer";
                                if (walletBalance > doc.amount) {
                                    result.message="transfer"+Config.SPLIT_CHAR+"false"+Config.SPLIT_CHAR+"Use your savings amount";

                                }

                                doc.response_info = result;
                                doc.result = true;
                                doc.save();
                                var response = {"success": true, "result": result};
                                res.send(response)



                            }




                            break;
                        default :
                            console.log("NO Request type found");
                            result.message= "NO Request type found";
                            doc.response_info = result;
                            doc.result = false;
                            doc.save();
                            var response = {"success": false, "result": result};
                            res.send(response);
                            break;

                    }

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
exports.testGCM = function (req, res) {

    var result = {"success":true,"message":"test gcm"}
    var message = new gcm.Message({
        collapseKey: 'imoney',
        delayWhileIdle: true,
        timeToLive: 3,
        dryRun: false,
        data: result
    });


    var gcmId = [];
    gcmId.push(req.body.gcm_id);

    var sender = new gcm.Sender(Config.GCM_API_KEY);
    sender.send(message, gcmId, 4, function (err, result) {
        console.log("notified user " + req.body.gcm_id);
        if(result)
        res.send(result);
        else
        res.send(err);
    });

}



