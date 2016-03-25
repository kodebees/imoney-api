var Customer = require('../models/customer');
var Config = require('../configs/config');
var gcm = require('node-gcm');
var isHeaderExist = function (req,headerName, success_callback, error_callback) {
    console.log("checking header " + headerName);
    console.log(req.headers[headerName]);
    if ( typeof (req.headers[headerName])   == "undefined") {
        console.log("throwing error");
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
   },function(error){
        next(error);
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
exports.sendGateWayPushNotification =function(data){
    var gcmId = [];
    console.log(data);
    gcmId.push("APA91bEAa3BvECw3VJGUK3Xinx0FynrOTMzhmMcsGjWC0UOsNUfc8dAbDwGrBslwSP6J9hefoN0RoFiR78tIi1Dv7HDQr09N9BEE_rf6XxUxkUBDPUXWgSgIAx_8uApMtUsSJzY__Nxm");
  var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 3,
        dryRun:false,
        data: data
    });
    var sender = new gcm.Sender(Config.GCM_API_KEY);
    sender.send(message, gcmId, 4, function (err, result) {
        console.log(result);
        console.log(result);
    });
}
exports.sendPushNotification=function(data,pushToken){
    var gcmId = [];

    gcmId.push(pushToken);

    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 3,
        dryRun:false,
        data: data
    });
    var sender = new gcm.Sender(Config.GCM_API_KEY);
    sender.send(message, gcmId, 4, function (err, result) {
        console.log(result);


        console.log(result);
    });
}
exports.composeSuccessResponse = function (res) {

    var response = {"success": true, "result": res};
    return response;

}

exports.composeFailureResponse = function (res) {

    var response = {"success": false, "result": res};
    return response;
}