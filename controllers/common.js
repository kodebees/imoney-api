



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

