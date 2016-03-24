/**
 * Created by Kodebees 
 */


// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


var config = require('./configs/config');

//Creating Controllers
var VerificationController = require('./controllers/verification');
var apiController = require('./controllers/icici_controller');
var blueMixBrokerController = require('./controllers/bluemixcontroller');
var commonController = require('./controllers/common');
var aadharController = require('./controllers/aadhar');
var customerController = require('./controllers/customer');
var transactionController = require('./controllers/transaction');
var redeemController = require('./controllers/redeem');
var gateWayController = require('./controllers/sms_gateway');


var webInterfaceController = require('./controllers/web_interface');



var cfenv = require('cfenv');
// Local variables..
var DBURI;
var PORT;



// Create express application
var app = express()

//app.set('superSecret', config.secret); // secret variable


app.use(bodyParser.json()); // to support JSON-encoded bodies

app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies







//Handle development and production environments and set ports and db connections accordingly..

/*
 You should only need to connect to your DB using a URL once at application start time, and there you can use code
 like you have to choose the correct URL based on the runtime environment. Once connected, you app should reference
 a shared database connection object to perform queries and operations as normal.
 */
 console.log("Environment selected is "+app.get('env'));
switch (app.get('env')){
    case  'development' :
        PORT = config.DEVELOPMENT_PORT;
        DBURI = config.DEVELOPMENT_MONGOURI;
        tmpDirectory = './tmp/';
        cloudDirectory = config.DEVELOPMENT_CLOUD_DIRECTORY;
        break;
    case 'production' :
        PORT = config.PRODUCTION_PORT;
        DBURI = config.PRODUCTION_MONGOURI;
        tmpDirectory = process.env.TEMP_DIR;
        cloudDirectory = process.env.CLOUD_DIR;
        break;
}




/*
app.use('/files',express.static("d:/store"));
*/

//Mongoose related configuration and connection handling..

// Create the database connection
mongoose.connect(DBURI);

var conn = mongoose.connection;

// CONNECTION EVENTS
// When successfully connected
conn.on('connected', function () {
   console.log('Mongoose default connection open to ' + DBURI);
    });

// If the connection throws an error
conn.on('error',function(err) {
    console.log('Mongoose default connection error: '+ err);
});

// When the connection is disconnected
conn.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});



// Create our Express router and routing ..

var router = express.Router();

router.use('/', commonController.checkApiKey);
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,appid');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});




router.use('/customer', commonController.isCustomerExist);
router.use('/wallet', commonController.isCustomerVerified);
router.use('/transfer', commonController.isCustomerVerified);
router.use('/transfer', commonController.isValidAmount);
router.use('/redeem',commonController.isValidAmount);
router.use('/transfer', commonController.isValidReceiver);



// Register all our routes with /api
app.use('/api', router);



var appEnv = cfenv.getAppEnv();

app.get('*', function(req, res, next) {
    var error = new Error();
    error.status = 404;
    error.message = "** no imoney here **"
    next(error);
});
app.post('*', function(req, res, next) {
    var error = new Error();
    error.status = 404;
    error.message = "** no imoney here **"
    next(error);
});
app.put('*', function(req, res, next) {
    var error = new Error();
    error.status = 404;
    error.message = "** no imoney here **"
    next(error);
});




app.use(function(err, req, res, next) {
    console.log("Handling error");
    console.log(err);
    err.success = false;
    var ErrorResult = {};
    ErrorResult.success = false;
    ErrorResult.error ={"code":err.status,"message":err.message}
    switch (err.status)
    {

        case 404:
           // res.send(err || '** no imoney here **');
            res.sendfile('./admin/index.html');
            break;
        case 101://undefined
            console.log("Error code 101");
            res.send(ErrorResult || "invalid parameter");
            console.log(err);
            break;
        case 102: //Model error
            res.send(err || "invalid appid");
            break;
        case 103:
            res.send(err || "invalid parameter");
            console.log(err);
            break;
        case 104:
            res.send(err || "invalid device ");
            break;
        case 105:
            var error ={};
            error.success=false;
            error.code = 105;
            error.message =err.message;
            res.send(error)

        default :
            console.log("Default error throwm");
            next();
    }

});
// 101 undefined
// 102 validation error
// 103 Invalid parameters
// 104 duplicate mobile number
// 105 verification code and mobile number does not match
router.route('/verify/mobile')
    .post(VerificationController.verifyMobileNumber);
router.route('/verify/aadhar')
    .post(VerificationController.verifyAadharNumber);

//verify mobile verification code and update device
router.route('/customer/device')
    .post(customerController.updateDevice);
//getWalletBalance and locker_amount
router.route('/wallet/balance')
    .get(customerController.getBalance);

//Update the locker amount
router.route('/wallet/locker_amount')
    .put(customerController.lockAmount);
//Create Transaction send Money
router.route('/transfer')
    .post(transactionController.onlineTransfer);
router.route('/testauth')
    .post(apiController.getAuthToken);

//Transaction Histroy
router.route('/transactions')
    .get(transactionController.transactionHistory);
//Redeem the amount from  the wallet convert to mcode
router.route('/redeem')
    .post(redeemController.redeem);

//Test GCM push notification
router.route('/gcm')
    .post(gateWayController.testGCM);

/*****************************************SMS Gateway request*******************************/
router.route('/sms/process')
    .post(gateWayController.processRequest);


/*****************************************SMS Gateway request*******************************/
/*Creating Dummy aadhar*/
router.route('/aadhar').post(aadharController.createAadhar);

/*
router.route('/transfer')

    .get(blueMixBrokerController.transferCash)

*/
router.route('/gateway').post(gateWayController.processRequest);

 router.route('/aadharDetails')
    .post(webInterfaceController.adharDetails);

router.route('/creditImoney')
    .post(webInterfaceController.creditImoney);




// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

    // print a message when the server starts listening
  console.log("iMoney server starting on " + appEnv.url);
});






