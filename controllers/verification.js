/**
 * Created by Dhamayanthi on 1/22/2015.
 */
var mobileVerification = require('../models/mobile_verification');
var unirest = require('unirest');

exports.verifyMobileNumber = function (req, res) {

console.log(req.body);

    new mobileVerification(req.body).save(function (err, doc) {

        if (err) {
            var errMessage = [];

            // go through all the errors...
            for (var errName in err.errors) {
                var message=err.errors[errName].message
                var errors={};
                errors[errName]=message
                errMessage.push(errors);
            }
            console.log(err);
            var errorResponse = {"success":false,"error":{"code":102, "message":errMessage}};//validation error
            res.send(errorResponse);
            return;
        }


        if(!doc) {

            return res.send({message : "check parameters"});

        }
        else{
        var result = {};
        result.verification_id = doc._id;
        result.message = "Message sent successfully"
        //Todo comment bellow line on production
        result.code =doc.verification_code;
        var template ="Welcome to IMoney, your verification code is "+result.code;
        // GET a resource
        var SMSApiUrl="http://api.mVaayoo.com/mvaayooapi/MessageCompose";
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
        var response = {"success":true,"result":result};

        console.log("Verification code for "+doc.mobile_number+" is "+doc.verification_code)

        res.send(response)
        }

    })

};
