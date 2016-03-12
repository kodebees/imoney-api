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
var commonController = require('./controllers/common')

// Local variables..
var DBURI;
var PORT;



// Create express application
var app = express()


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




// Register all our routes with /api
app.use('/api', router);


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
    switch (err.status)
    {
        case 404:
            res.send(err.message || '** no imoney here **');
            break;
        case 101://undefined
            res.send(err.message || "invalid parameter");
            console.log(err.status);
            break;
        case 102:
            res.send(err.message || "invalid appid");
            break;
        case 103:
            res.send(err.message || "invalid parameter");
            console.log(err.status);
            break;
        case 104:
            res.send(err.message || "invalid device ");
            break;
        case 105:
            var error ={};
            error.success=false;
            error.code = 105;
            error.message =err.message;
            res.send(error)

        default :
            next();
    }

});
// 101 undefined
// 102 validation error
// 103 Invalid parameters
// 104 duplicate mobile number
// 105 verification code and mobile number does not match
router.route('/sendCode')
    .post(VerificationController.verifyMobileNumber);
router.route('/testauth')
    .post(apiController.getAuthToken);
   

var server = app.listen(PORT, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('imoney  app listening at http://%s:%s', host, port)

})





