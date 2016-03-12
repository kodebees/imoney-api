var unirest = require('unirest');
var mobileVerification = require('../models/mobile_verification'); 

//http://corporate_bank.mybluemix.net/corporate_banking/mybank/authenticate_client?client_id=sureshrgopal@gmail.com&password=ICIC4816

exports.getAuthToken = function (req, res) { 

  var SMSApiUrl="http://corporate_bank.mybluemix.net/corporate_banking/mybank/authenticate_client";
        unirest.get(SMSApiUrl)
            .query({'client_id': 'sureshrgopal@gmail.com','password': 'ICIC4816'})
           // .query({'password': 'ICIC4816'})
            .end(function(response) {
                if (res.error) {
                    console.log('GET error', response.error);
                    res.send( response.error);

                } else {
                    console.log('GET response', response.body);
                     res.send( response.body);
                  
                }
                 /* var response = {"success":true,"result":res.body};*/
                    


            })
        
    }