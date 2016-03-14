var Customer = require('../models/customer');
var mobileVerification = require('../models/mobile_verification');

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
                    console.log(customer);
                    var result = {};
                    result.message = "Mobile Number verified Successfully";
                    var response = {"success": true, "result": result};
                    res.send(response);
                    return;
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
            result.amount = customer.wallet.balance;
            result.locker_amount = customer.locker_amount;
            var response = {"success": true, "result": result};
            res.send(response);
            return;
        }
    });
}
