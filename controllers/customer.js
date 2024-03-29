var Customer = require('../models/customer');
var mobileVerification = require('../models/mobile_verification');
var blueMixBrokerController = require('./bluemixcontroller');
var commonController = require('./common');

exports.updateDevice = function (req, res) {
    var number = req.body.mobile_number;
    var vid = req.body.verification_id;
    var vcode = req.body.verification_code;
    var deviceInfo = req.body.deviceInfo;
    var customerId = req.headers.customerid;

    mobileVerification.findById(vid, function (err, doc) {
        if (err) {
            console.log("error" + err);
            return res.send(401, {error: err});
        }
        if (!doc) {
            var errorResponse = {
                "success": false,
                "error": {"code": 102, "message": "Please check verification again"}
            };//validation error
            res.send(errorResponse);
            return;
        }

        if (doc.verification_code == vcode && doc.mobile_number == number) {
            Customer.findByIdAndUpdate(customerId, {is_phone_verified: true, deviceInfo: deviceInfo}, function (err, customer) {
                if (err) {
                    console.log("Error")
                    return res.status(600).send({error: err});
                }
                if (customer) {

                    customer.ip_address = req.connection.remoteAddress;

                    blueMixBrokerController.createiMoneyWallet(customer,function(response){

                   

                    try{

                        customer.wallet.id = response.WalletDetails[0].auth_data;
                        customer.save();
                         var result = {};
                        result.message = "iMoney Wallet Created Successfully";
                        var wallet_response = commonController.composeSuccessResponse(result);
                        res.send(wallet_response);

                        return;

                    }catch(e){

                        console.log('Exception:' ,e);
                        var result = {};
                        result.message = "iMoney Wallet Creation Failed";
                        //ToDo once icici give stable response un commnet the below line
                      //  var wallet_response = commonController.composeFailureResponse(result);
                        var wallet_response = commonController.composeSuccessResponse(result);
                        res.send(wallet_response);
                        return;
                    }
                       

                    },function(error){

                        var result = {};
                        result.message = "iMoney Wallet Creation Failed";
                        var wallet_response = commonController.composeFailureResponse(result);
                        res.send(wallet_response);
                        return;

                    });
                }
                else{
                    var errorResponse = {
                        "success": false,
                        "error": {"code": 102, "message": "No customer found"}
                    };//validation error
                    res.send(errorResponse);
                    return;
                }
            });
        }
        else {
            var errorResponse = {
                "success": false,
                "error": {"code": 102, "message": "verification code and mobile number does not match"}
            };//validation error
            res.send(errorResponse);
            return;
        }


    })

}

exports.lockAmount = function(req,res){
    var customerId = req.headers.customerid;
   var lock_amount = req.body.amount;
    Customer.findById(customerId, function (err, customer) {
        if(customer.wallet.balance > lock_amount){
            //update the locker amount
            customer.locker_amount = lock_amount;
            customer.save()
            var result = {};
            result.message = "Wallet Balance";
            result.amount = customer.wallet.virtual_balance ;
            result.locker_amount = customer.locker_amount;
            var response = {"success": true, "result": result};
            res.send(response);
        }
        else
        { var errorResponse = {
            "success": false,
            "error": {"code": 102, "message": "No sufficent fund to lock"}
        };
            res.send(errorResponse);
            return;

        }
    });
}

exports.getBalance = function(req,res){
    var customerId = req.headers.customerid;

    Customer.findById(customerId, function (err, customer) {
        if (err) {
            console.log("Error")
            return res.status(600).send({error: err});
        }
        if (customer) {
            console.log(customer);
            var result = {};
            result.message = "Wallet Balance";
            result.amount = customer.wallet.virtual_balance ;
            result.locker_amount = customer.locker_amount;
            var response = {"success": true, "result": result};
            res.send(response);
            return;
        }
    });
}
