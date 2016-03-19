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
        "customer":receiverId,
        "name":req.body.receiver_name
    };
    var CreditTransaction = {
        "transaction_type":"CREDIT",
        "description":req.body.desc,
        "amount":credit_amount,
        "customer":customerId,
        "name":req.body.customer_name
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
                            result.balance =  customer.wallet.virtual_balance;
                            result.locker_amount = customer.locker_amount;
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


exports.transactionHistory = function(req,res){
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


