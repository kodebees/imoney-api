var Customer = require('../models/customer');
var DebitTransaction = {
    "transaction_type": "DEBIT",
    "description": "Debited",
    "amount": 0,
    "customer": "",
    "name": ""
};
var CreditTransaction = {
    "transaction_type": "CREDIT",
    "description": "Credited",
    "amount": 0,
    "customer": "",
    "name": ""
};
var details = {
    sender_id: "",
    receiver_id: "",
    amount: 0,
    receiver_name: ""
}
var transferAmount = function (details, success_callback, error_callback) {
    //Positive Amount for receiver converted the amount even it is negative from request
    var debit_amount = Math.abs(details.amount) * -1;
    var credit_amount = Math.abs(details.amount);
    //Debit the Amount from Sender
    DebitTransaction.amount = debit_amount;
    DebitTransaction.customer = details.receiver_id;
    DebitTransaction.name = details.receiver_name;
    Customer.findByIdAndUpdate(details.sender_id, {$push: {'transactions': DebitTransaction}}, function (err, customer) {
        if (err) {
            error_callback(err);
            return;
        }
        if (customer) {
            //Transaction Debited
            //ToDO icici brokerege should be done here
            //Credit the amount to Receiver
            CreditTransaction.name = customer.full_name;
            CreditTransaction.amount = credit_amount;
            CreditTransaction.customer = customer._id;
            Customer.findByIdAndUpdate(details.receiver_id, {$push: {'transactions': CreditTransaction}}, function (err, receiver) {
                if (err) {
                    error_callback(err);
                    return 0;
                }
                if (receiver) {

                    var result = {};
                    result.message = "Fund Transferred";
                    customer.wallet.balance += debit_amount;
                    receiver.wallet.balance += credit_amount;
                    result.balance = customer.wallet.virtual_balance;
                    result.locker_amount = customer.locker_amount;
                    //Updating the Wallet balance for sender
                    customer.save();
                    //Updating the Wallet balance for receiver
                    receiver.save();
                    var response = {"success": true, "result": result};
                    console.log(result);
                    success_callback(result);
                    return 0;
                }
            });
        }

    });

};
exports.onlineTransfer = function (req, res) {
    details.amount = req.body.amount;
    details.sender_id = req.headers.customerid;
    details.receiver_id = req.body.receiver_token;
    details.receiver_name = req.body.receiver_name;
    transferAmount(details,function(result){
        var response = {"success": true, "result": result};
        res.send(response);

    },function(error){
        var response = {"success": false, "message": error};
        res.send(response);
    })
};
exports.smsTransfer = function(details,success_callback,error_callback){
transferAmount(details,success_callback,error_callback);
}

exports.transactionHistory = function (req, res) {
    var customerId = req.headers.customerid;

    Customer.findById(customerId, function (err, customer) {
        if (err) {
            console.log("Error")
            return res.status(600).send({error: err});
        }
        if (customer) {
            console.log(customer);
            var result = {};
            result.message = "Transaction History";

            result.transactions = customer.transactions;

            var response = {"success": true, "result": result};
            res.send(response);
            return;
        }
    });
}


