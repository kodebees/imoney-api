/*
This Controller ROUTES the request from client to ICICI Pocket

The following are the endpoints which are availabe

POST /createiMoneyWallet - Creates a new account/iMoneyWallet
GET  /checkiMoneyWalletBalance - Checks an iMoney users wallet for balance and returns it

POST /transferCash - Transfers cash from one iMoneyWallet to other
GET  /getTransationDetails - Gets all transaction history of the requested iMoneyWallet

*/

var unirest = require('unirest');
var cfenv = require('cfenv');
var config = require('../configs/config')
var appEnv = cfenv.getAppEnv();

/*
	This function creates a new wallet in ICICI Environment (Equals creating a new user in iMoney,caller of this function implements new user logic)
	
*/
exports.createiMoneyWallet = function (customer,on_success,on_error) {

 var walletCreationAPIURL = "http://alphaiciapi2.mybluemix.net/rest/Wallet/createWallet/"
 							 + config.merchant_id	+"/"
 							 + config.walletScope +"/"
 							 + customer.first_name +"/"
 							 + customer.last_name +"/"
 							 + customer.email +"/"
 							 + customer.mobile_number +"/"
 							 + customer.dob +"/"
 							 + customer.gender +"/"
 							 + customer.ip_address +"/"
 							 + customer.deviceInfo.platform +"/"
 							 + customer.deviceInfo.uuid +"/"
 							 + customer.deviceInfo.imei +"/"
 							 + "sureshrgopal@gmail.com" + "/"
 							 + "2671af561974"
	/*  + process.env.client_id +"/"
 							 + process.env.auth_token*/

 							 console.log(walletCreationAPIURL)


	 unirest.get(walletCreationAPIURL)
            .end(function(response) {
  
                if (response.error) {
                    console.log('Wallet Creation Error', response.error);
                    on_error(JSON.parse(response.body));

                } else {
                    console.log('Wallet Status : ', response.body);
                    on_success(JSON.parse(response.body));
                }
            })
					 
    }

/*
	This function returns the balance amount in users wallet
	
	PARAMS PASSED
   
*/
exports.getWalletBalance = function(customer){

}


/*
	This function transfers amount from one wallet to the other
	
	PARAMS PASSED

	http://alphaiciapi2.mybluemix.net/rest/Wallet/creditWalletAmount

{
"id_type": "TOKEN",
"id_value": "abcVxAfkBTN7t3jjnrdw",
"auth_type": "TOKEN",
"auth_data": "2d9c2fe842854b079bb2",
"txn_id": "123498",
"amount": 100,
"promocode": "pockt1234",
"remarks": "Cake shop",
"sub_merchant": "Cakerina",
"latitude": 19.11376955,
"longitude": 73.8500124,
"imei": "35550702720000",
"device_id": "7b47c06dsj12243",
"ip_address": "194.154.205.26",
"os": "android",
"clientID":"test@abc.com",
"authToken":"f5316a5e35a4"
}

A transfer cash call does the following
		
		Debit sender's wallet account and credits banks account
		Debit banks account and credit reciever's wallet account
   
*/

exports.transferCash = function(req,res){

 var creditWalletAmountURL = "http://alphaiciapi2.mybluemix.net/rest/Wallet/creditWalletAmount"
 var debitWalletAmountURL = "http://alphaiciapi2.mybluemix.net/rest/Wallet/debitWalletAmount"

    console.log(creditWalletAmountURL)

	 unirest.post(creditWalletAmountURL)
	 		.header({'Accept': 'application/json','Authorization' : 'Basic bWVyXzEyMzo='})
	 		.type('json')
	 		.send({
				"id_type": "TOKEN",
				"id_value": "80277e30a21c4084b5c9",
				"auth_type": "TOKEN",
				"auth_data": "80277e30a21c4084b5c9",
				"txn_id": 8982,
				"amount": 1000,
				"clientID": process.env.client_id,
				"authToken": process.env.auth_token

})
            .end(function(response) {
  
                if (response.error) {
                    console.log('Cash transfer error', response.error);
                    res.send(response.error)
                    //on_error(JSON.parse(response.body));

                } else {
                    console.log('Cash transfer status : ', response.body);
                    res.send(response.body);
                   //on_success(JSON.parse(response.body));
                   
                }
            })


}

/*
	This function gets all the transactions made from the given Wallet ID
	
	PARAMS PASSED
   
*/

exports.getTransationDetails = function(req,res){

}