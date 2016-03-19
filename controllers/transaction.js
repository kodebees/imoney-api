var Customer = require('../models/customer');


exports.transfer = function (req, res) {

    var customerId = req.headers.customerid;
    var receiverId = req.body.receiver_token;
    //Debit transaction so make it as negative
    var amount = Math.abs(req.body.amount) * -1;
    var credit_amount =  Math.abs(req.body.amount);
    var DebitTransaction = {
        "transaction_type":"DEBIT",
        "description":"Debited",
        "amount":amount,
        "customer":receiverId,
        "name":req.body.receiver_name
    };
    var CreditTransaction = {
        "transaction_type":"CREDIT",
        "description":"Credited",
        "amount":credit_amount,
        "customer":customerId,
        "name":""
    };

        //Debit the amount fom sender
            Customer.findByIdAndUpdate(customerId,  { $push: { 'transactions': DebitTransaction}}, function (err, customer) {
                if (err) {
                    console.log("Error")
                    return res.status(600).send({error: err});
                }
                if (customer) {
                    //Transaction Debited
                    //ToDO icici brokerege should be done here
                    //Credit the amount to Receiver
                    CreditTransaction.name=customer.full_name;
                    Customer.findByIdAndUpdate(receiverId,  { $push: { 'transactions': CreditTransaction}}, function (err, receiver) {
                        if (err) {
                            console.log("Error")
                            return res.status(600).send({error: err});
                        }
                        if (receiver) {

                            var result = {};
                            result.message = "Fund Transferred";
                            customer.wallet.balance += amount;
                            receiver.wallet.balance += credit_amount;
                            result.balance =  customer.wallet.virtual_balance;
                            result.locker_amount = customer.locker_amount;
                            customer.save();
                            receiver.save();
                            var response = {"success": true, "result": result};
                            console.log(response);
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


