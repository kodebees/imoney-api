var Customer = require('../models/customer');


exports.transfer = function (req, res) {

    var customerId = req.headers.customerid;
    var receiverId = req.body.receiver_token;
    //Debit transaction so make it as negative
    var amount = Math.abs(req.body.amount) * -1;
    var credit_amount =  Math.abs(req.body.amount);
    var DebitTransaction = {
        "transaction_type":"DEBIT",
        "description":req.body.desc,
        "amount":amount,
        "customer":receiverId
    };
    var CreditTransaction = {
        "transaction_type":"CREDIT",
        "description":req.body.desc,
        "amount":credit_amount,
        "customer":customerId
    };

            Customer.findByIdAndUpdate(customerId,  { $push: { 'transactions': DebitTransaction}}, function (err, customer) {
                if (err) {
                    console.log("Error")
                    return res.status(600).send({error: err});
                }
                if (customer) {
                    //Transaction Debited
                    Customer.findByIdAndUpdate(receiverId,  { $push: { 'transactions': CreditTransaction}}, function (err, receiver) {
                        if (err) {
                            console.log("Error")
                            return res.status(600).send({error: err});
                        }
                        if (receiver) {
                            console.log(receiver);
                            var result = {};
                            result.message = "Fund Transferred";
                            customer.wallet.balance += amount;
                            receiver.wallet.balance += credit_amount;
                            result.balance = customer.wallet.balance;
                            customer.save();
                            receiver.save();
                            var response = {"success": true, "result": result};
                            res.send(response);
                            return;
                        }
                    });
                }

            });



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
            result.amount = customer.wallet.balance;
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
            result.amount = customer.wallet.balance;
            result.locker_amount = customer.locker_amount;
            var response = {"success": true, "result": result};
            res.send(response);
            return;
        }
    });
}
