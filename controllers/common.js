
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

