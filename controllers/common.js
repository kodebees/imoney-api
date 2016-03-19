var Customer = require('../models/customer');
var Config = require('../configs/config');

var isHeaderExist = function (req,headerName, success_callback, error_callback) {
    console.log("checking header " + headerName);
    if (req.headers[headerName] == undefined) {
        var err = new Error();
        err.status = 101; //undefined
        err.message = "Invalid parameter in header refer api doc";
        error_callback(err);
    }
    else {
        console.log("header " + headerName+" Found");
        success_callback();
    }
}
var customerExist = function (customer_id, success_callback, error_callback) {
    Customer.findById(customer_id, function (err, customer) {
        if (err) {
            error_callback(err);
            return 0;
        }
        if (customer) {
            success_callback(customer)
            return 0;
        }
        else {
            var err = new Error();
            err.status = 101; //undefined
            err.message = "customer doesn't exist";
            error_callback(err);
            return 0;
        }
    });
}
exports.getCustomerInfo=function(customer_id,success_callback,error_callback){
    customerExist(customer_id,function(result){
        success_callback(result);
    },function(error){
        error_callback(error);
    })
}
exports.checkApiKey = function (req, res, next) {


    isHeaderExist(req,'appid',function(){
       if (req.headers.appid == Config.APP_ID)
       {
           next();
       }
       else
       {
           var err1 = new Error();
           err1.status = 102; //Invalid appid
           err1.message = "Invalid Appid";
           next(err1);

       }
   });

};


//Is Customer Exist in database
exports.isCustomerExist = function (req, res, next) {
    isHeaderExist(req,'customerid', function () {
        var customerId = req.headers.customerid;
        customerExist(customerId, function (result) {
                req.body.customer_name = result.full_name;
                next();
            },
            function (error) {
                next(error);
            });
    }, function (error) {
        next(error)
    })


};
//Is Customer phone Verified

exports.isCustomerVerified = function (req, res, next) {

    isHeaderExist(req,'customerid',function(){
        var customerId = req.headers.customerid;

            customerExist(customerId,function(customer){
                if (customer.is_phone_verified) {
                    next();
                }
                else
                {
                    var err = new Error();
                    err.status = 101; //undefined
                    err.message = "mobile number not verified";
                    next(err);
                }
            },function(error){
                next(error);
            });

    },
    function(error){
        next(error);
    })


};
//Is valid Amount to transfer
exports.isValidAmount = function (req, res, next) {


    var customerId = req.headers.customerid;
    //Make the amount absolute incase of negative number
    var amount = Math.abs(req.body.amount);


    Customer.findById(customerId, function (err, customer) {
        if (err) {
            console.log("Error")
            return res.status(600).send({error: err});
        }
        if (customer) {
            var walletBalance = customer.wallet.balance;
            var lockerAmount = customer.locker_amount;
            var liquidBalance = walletBalance - lockerAmount;

            if (liquidBalance > amount)
                next();
            else {
                var err = new Error();
                err.status = 101; //undefined
                err.message = "No sufficient fund to transfer";
                if (walletBalance > amount) {
                    err.message = "Use your savings amount";
                }


                next(err);
            }
        }

    });

};
//Is Reciver avail in our db or not
exports.isValidReceiver = function (req, res, next) {

    console.log("Validate receiver");

    var customerId = req.headers.customerid;
    //Make the amount absolute incase of negative number
    var receiverId = req.body.receiver_token;

    Customer.findById(receiverId, function (err, receiver) {
        if (err) {
            var err = new Error();
            err.status = 101; //undefined
            err.message = "No Receiver found";
            next(err);
        }
        if (receiver) {
            if (receiver.is_phone_verified) {
                req.body.receiver_name = receiver.full_name;
                next();
            }
            else {
                var err = new Error();
                err.status = 101; //undefined
                err.message = "Not authenticated Receiver found";
                next(err);
            }
        }
        else {
            var err = new Error();
            err.status = 101; //undefined
            err.message = "No Receiver found";
            next(err);
        }

    });

};
exports.composeSuccessResponse = function (res) {

    var response = {"success": true, "result": res};
    return response;

}

exports.composeFailureResponse = function (res) {

    var response = {"success": false, "result": res};
    return response;
}