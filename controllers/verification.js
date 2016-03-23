var mobileVerification = require('../models/mobile_verification');
var aadharVerification = require('../models/aadhar_verification');
var Aadhar = require('../models/aadhar');
var Customer = require('../models/customer');
var Aadhar = require('../models/aadhar');
var unirest = require('unirest');
var gcm = require('node-gcm');

exports.verifyAadharNumber = function (req, res) {
    console.log("Verfiy aadharnumber " + req.body.aadhar_number);
    new aadharVerification(req.body).save(function (err, doc) {
        if (err) {
            //var errMessage;

            // go through all the errors...
            for (var errName in err.errors) {
                var message = err.errors[errName].message
               // var errors = {};
               // errors[errName] = message
                console.log(message);
                //errMessage+=message;
            }
            console.log(err);
            var errorResponse = {"success": false, "error": {"code": 102, "message": message}};//validation error
            res.send(errorResponse);
            return;
        }


        if (!doc) {

            return res.send({message: "check parameters"});

        }
        else {
            var result = {};

            //check if customer already exist in our system
            Customer.findOne({aadhar_number: req.body.aadhar_number}, function (error, customerInfo) {
                if(customerInfo)
                {

                    result.customerInfo = customerInfo;
                    result.message ="Confirm your mobile number again, Welcome back to imoney";
                    var response = {"success": true, "result": result};
                    res.send(response)
                }
                else
                {
                    //request the ncp api for verfiy and get ekyc of customer
                    //get the response

                    //mock from local db
                    Aadhar.findOne({uid: req.body.aadhar_number}, function (error, aadharInfo) {
                        if(error)
                        {
                            console.log("error"+error);
                            var err = new Error();
                            err.status = 101; //undefined
                            err.message =error;
                            var errorResponse = {"success": false, "error": err};//validation error
                            res.send(errorResponse);
                        }
                        else if(aadharInfo)
                        {
                            console.log(aadharInfo);

                            result.message = "confirm the aadhar info and mobile number";
                            var customerInfo = new Customer();
                            customerInfo.mobile_number = aadharInfo.phone;
                            customerInfo.aadhar_number = aadharInfo.uid;
                            customerInfo.first_name =aadharInfo.first_name;
                            customerInfo.last_name=aadharInfo.last_name;
                            customerInfo.email=aadharInfo.email;
                            customerInfo.gender =aadharInfo.gender;

                            customerInfo.address={
                                "street":aadharInfo.street,
                                "vtc":aadharInfo.vtc,
                                "subdist":aadharInfo.subdist,
                                "district":aadharInfo.district,
                                "state":aadharInfo.state,
                                "pincode":aadharInfo.pincode
                            };
                            customerInfo.dob= aadharInfo.dob;
                            customerInfo.save(
                                function(err,newCustomer)
                                {
                                    if (err) {
                                       // var errMessage = [];

                                        // go through all the errors...
                                        for (var errName in err.errors) {
                                            var message = err.errors[errName].message
                                            // var errors = {};
                                            // errors[errName] = message
                                            console.log(message);
                                            //errMessage+=message;
                                        }
                                        console.log(err);
                                        var errorResponse = {"success": false, "error": {"code": 102, "message": message}};//validation error
                                        res.send(errorResponse);
                                        return;
                                    }
                                    if(newCustomer){
                                        result.customerInfo = customerInfo;
                                        result.message ="Confirm your mobile number";
                                        var response = {"success": true, "result": result};


                                        res.send(response)
                                    }
                                }
                            );
                        }
                        else
                        {
                            var err = new Error();
                            err.status = 404; //undefined
                            err.message ="No Number found in Aadahar DB";
                            var errorResponse = {"success": false, "error": err};//validation error
                            res.send(errorResponse);
                        }

                    });
                }
            });



        }


    });
}
exports.verifyMobileNumber = function (req, res) {

   var  mobile_number = req.body.mobile_number;

    new mobileVerification(req.body).save(function (err, doc) {

        if (err) {
            var errMessage;

            // go through all the errors...
            for (var errName in err.errors) {
                var message = err.errors[errName].message
                // var errors = {};
                // errors[errName] = message
                console.log(message);
                //errMessage+=message;
            }
            console.log(err);
            var errorResponse = {"success": false, "error": {"code": 102, "message": message}};//validation error
            res.send(errorResponse);
            return;
        }


        if (!doc) {

            return res.send({message: "check parameters"});

        }
        else {
            var result = {};
            var gcmId = [];
           // var push_token = "APA91bFgArM4TQJnrPFbGP3mofo-6AffFtMBsLkQWHhC7oV983dxfrU5jeTTz6Zi6RtIpKdlOVuI0ervu3dXj4XAA5GipWRoDc6PE0B0XBi8c0IeLlKUiUbQB7ThQfkHeF050rFcq2yB";
            gcmId.push("APA91bEAa3BvECw3VJGUK3Xinx0FynrOTMzhmMcsGjWC0UOsNUfc8dAbDwGrBslwSP6J9hefoN0RoFiR78tIi1Dv7HDQr09N9BEE_rf6XxUxkUBDPUXWgSgIAx_8uApMtUsSJzY__Nxm");
            result.verification_id = doc._id;
            result.message = "verification"
            //Todo comment bellow line on production
            result.code = doc.verification_code;
            result.mobile_number = mobile_number;
            //var template = "Welcome to IMoney, your verification code is " + result.code;
            var message = new gcm.Message({
                collapseKey: 'demo',
                delayWhileIdle: true,
                timeToLive: 3,
                dryRun:false,
                data: result
            });
            var sender = new gcm.Sender('AIzaSyA7zTog1nDSbo9i-4C3zLLLLceATJsmukk');
            sender.send(message, gcmId, 4, function (err, result) {
                console.log(result);


                console.log(result);
            });


            // GET a resource
           // var SMSApiUrl = "http://api.mVaayoo.com/mvaayooapi/MessageCompose";
            /* unirest.get(SMSApiUrl)
             .query({'user': 'veuontechnologies@gmail.com:wordpass321'})
             .query({'senderID': 'VEUONT'})
             .query({'receipientno':doc.mobile_number})
             .query({'dcs': '0'})
             .query({'msgtxt': template})
             .query({'state': '4'})
             .end(function(res) {
             if (res.error) {
             console.log('GET error', res.error);

             } else {
             console.log('GET response', res.body)

             }

             })*/
            var response = {"success": true, "result": result};

            console.log("Verification code for " + doc.mobile_number + " is " + doc.verification_code)

            res.send(response)
        }

    });

};
