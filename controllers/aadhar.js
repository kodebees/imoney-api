var Aadhar = require('../models/aadhar');

exports.createAadhar = function (req, res) {

    new Aadhar(req.body).save(function (err, doc) {
        if (err) {
            var errMessage = [];

            // go through all the errors...
            for (var errName in err.errors) {
                var message = err.errors[errName].message
                var errors = {};
                errors[errName] = message
                errMessage.push(errors);
            }
            console.log(err);
            var errorResponse = {"success": false, "error": {"code": 102, "message": errMessage}};//validation error
            res.send(errorResponse);
            return;
        }


        if (!doc) {

            return res.send({message: "check parameters"});

        }
        else {
            var result = {};
            result.message ="Dummyy Aadhar Created Successfully";
            var response = {"success": true, "result": result};


            res.send(response)

        }


    });
}
