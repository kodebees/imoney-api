

// App configurations
var config = {}



config.DEVELOPMENT_PORT = '3000';
config.PRODUCTION_PORT = '8080';



config.PRODUCTION_MONGOURI = 'mongodb://devtester:codedevil@aws-us-east-1-portal.14.dblayer.com:10613/imoney';

config.DEVELOPMENT_MONGOURI = 'mongodb://localhost/imoney';


config.DEVELOPMENT_CLOUD_DIRECTORY = './uploads/';
/*
config.PRODUCTION_CLOUD_DIRECTORY = '/app-storage';
*/
//config.DEVELOPMENT_BASE_URL = 'http://136b3f15.ngrok.com';
config.DEVELOPMENT_BASE_URL = 'http://localhost:3000';
config.PRODUCTION_BASE_URL = 'http://imoneycheck.mybluemix.net';
config.GCM_API_KEY ="AIzaSyA7zTog1nDSbo9i-4C3zLLLLceATJsmukk";
config.APP_ID = "123";

config.walletScope = "create";
config.merchant_id = "mer_123";

/*SMS GATEWAY CONFIGS*/
var smsRoute = {
    GET_BALANCE:"getBalance",
    TRANSFER:"transfer"
}
config.SPLIT_CHAR = '~';

config.SMS_ROUTE =smsRoute;

module.exports = config;

