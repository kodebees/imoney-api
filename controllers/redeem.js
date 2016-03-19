var Customer = require('../models/customer');
var Redeem = require('../models/redeem');

exports.redeem = function (req, res) {

    var customerId = req.headers.customerid;
    //Debit transaction so make it as negative
    var amount = Math.abs(req.body.amount) * -1;
    var credit_amount =  Math.abs(req.body.amount);
    var DebitTransaction = {
        "transaction_type":"DEBIT",
        "description":"Redemed",
        "amount":amount,
        "name":"Redeemed",
        "redeem_flag":1
    };


    Customer.findByIdAndUpdate(customerId,  { $push: { 'transactions': DebitTransaction}}, function (err, customer) {
        if (err) {
            console.log("Error")
            return res.status(600).send({error: err});
        }
        if (customer) {
            //Transaction Debited
            console.log("redeemed", customer.mobile_number);
            var result = {};
            result.message = "Amount Redeemed";

            customer.wallet.balance += amount;
            result.balance = customer.wallet.virtual_balance;
            result.locker_amount = customer.locker_amount;
            customer.save();
            var redeemTransaction = new Redeem();
            redeemTransaction.mobile_number = customer.mobile_number;
            redeemTransaction.amount= credit_amount;
            redeemTransaction.save(function(err,redeemed){
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
            });

        }

    });



}
