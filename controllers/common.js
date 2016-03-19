
var Customer = require('../models/customer');

exports.checkApiKey = function (req, res, next) {
    console.log("checking header");
    if(req.headers.appid == undefined)
    {
        var err = new Error();
        err.status = 101; //undefined
        err.message ="Invalid parameter in header refer api doc";
        next(err);
    }

   else if(req.headers.appid=="123") {
        console.log("valid appID")
        next();
    }
    else{
        console.log("else log");
        var err1 = new Error();
        err1.status = 102; //Invalid appid
        err1.message ="Invalid Appid";
        next(err1);
    }
};
//Is Customer Exist in database
exports.isCustomerExist = function (req, res, next) {
    console.log("checking header");
    if(req.headers.customerid == undefined)
    {
        var err = new Error();
        err.status = 101; //undefined
        err.message ="Invalid parameter in header refer api doc";
        next(err);
    }
    var customerId = req.headers.customerid;

    Customer.findById(customerId, function (err, customer) {
        if (err) {
            console.log("Error")
            return res.status(600).send({error: err});
        }
        if (customer) {
            req.body.customer_name = customer.full_name;
            next();
        }
        else{
            var err = new Error();
            err.status = 101; //undefined
            err.message ="customer doesn't exist";
            next(err);
        }
    });

};
//Is Customer phone Verified
//ToDo utilize the above method to vefiy the exist customer
exports.isCustomerVerified = function (req, res, next) {

    if(req.headers.customerid == undefined)
    {
        var err = new Error();
        err.status = 101; //undefined
        err.message ="Invalid parameter in header refer api doc";
        next(err);
    }
    var customerId = req.headers.customerid;

    Customer.findById(customerId, function (err, customer) {
        if (err) {
            console.log("Error")
            return res.status(600).send({error: err});
        }
        if (customer) {
            if(customer.is_phone_verified)
            {

                next();
            }

            else{
                var err = new Error();
                err.status = 101; //undefined
                err.message ="mobile number not verified";
                next(err);
            }
        }
        else{
            var err = new Error();
            err.status = 101; //undefined
            err.message ="customer doesn't exist";
            next(err);
        }
    });

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
            var liquidBalance = walletBalance-lockerAmount;

            if(liquidBalance > amount)
                next();
            else{
                var err = new Error();
                err.status = 101; //undefined
                err.message ="No sufficient fund to transfer";
                if(walletBalance > amount)
                {
                    err.message ="Use your savings amount";
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
            err.message ="No Receiver found";
            next(err);
        }
        if (receiver) {
           if(receiver.is_phone_verified) {
               req.body.receiver_name = receiver.full_name;
               next();
           }
            else
           {
               var err = new Error();
               err.status = 101; //undefined
               err.message ="Not authenticated Receiver found";
               next(err);
           }
        }
        else
        {
            var err = new Error();
            err.status = 101; //undefined
            err.message ="No Receiver found";
            next(err);
        }

    });

};
exports.composeSuccessResponse =function(res){

                    var response = {"success": true, "result": res};
                    return response;

}

exports.composeFailureResponse =function(res) {

                    var response = {"success": false, "result": res};
                    return response;
}