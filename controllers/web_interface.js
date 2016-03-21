
var mobileVerification = require('../models/mobile_verification');
var aadharVerification = require('../models/aadhar_verification');
var Aadhar = require('../models/aadhar');
var Customer = require('../models/customer');

var unirest = require('unirest');

exports.adharDetails = function (req, res) {

    console.log("aadharnumber " + req.body.aadhar_number);

            var result = {};

            //check if customer already exist in our system
            Customer.findOne({aadhar_number: req.body.aadhar_number}, function (error, customerInfo) {

                if(error)
                {
                    console.log("error"+error);
                    var err = new Error();
                    err.status = 101; //undefined
                    err.message =error;
                    var errorResponse = {"success": false, "error": err};//validation error
                    res.send(errorResponse);
                }
                else if(customerInfo)
                {

                    result.customerInfo = customerInfo;
                    result.message ="Welcome imoney customer";
                    var response = {"success": true, "result": result};
                    console.log(customerInfo.first_name);
                    res.send(response)
                }
                else
                {
                    var err = new Error();
                    err.status = 404; //undefined
                    err.message ="No Number found in customer DB";
                    var errorResponse = {"success": false, "error": err};//validation error
                    res.send(errorResponse);
                }
            })
}



exports.creditImoney = function (req, res) {

    console.log("in imoney credit");

    var customerId = req.body.customerid;
    //Credit transaction

    console.log(customerId);
    console.log(req.body.amount);
    var credit_amount = Math.abs(req.body.amount) ;
    console.log(credit_amount);

    var CreditTransaction = {
        "transaction_type":"CREDIT",
        "description":"credited trough bank",
        "amount":credit_amount,
        "name":"credited",
        "redeem_flag":2
    };


    Customer.findByIdAndUpdate(customerId,  { $push: { 'transactions': CreditTransaction}}, function (err, customer) {
        if (err) {
            console.log("Error")
            return res.status(600).send({error: err});
        }
        if (customer) {
            //Transaction Credited
            console.log("credited trough bank", customer.mobile_number);
            var result = {};
            result.message = "Amount credeted through bank";

            customer.wallet.balance += credit_amount;
            result.balance = customer.wallet.balance;
            result.locker_amount = customer.locker_amount;
            customer.save();

            var response = {"success": true, "result": result};
            res.send(response);
            return;
            //var redeemTransaction = new Redeem();
            //redeemTransaction.mobile_number = customer.mobile_number;
            //redeemTransaction.amount= credit_amount;
           /* redeemTransaction.save(function(err,redeemed){
                if(redeemed)
                {
                    result.mcode = redeemed.mcode;
                    var response = {"success": true, "result": result};
                    res.send(response);
                    return;
                }
                if(err)
                {
                    return res.status(600).send({error: err});
                }
            });*/

        }

    });



}
