const AUTH = require("./auth/auth");
const MAT = require("./mat/mat");
const PLAYER = require("./player/player");
const UTILITY = require("./utility/utility");
async function makeResponse(res, data, code) {
    var response = {
        status: code, // int
        body: data //json obj
    }
    res.send(response);
}


exports.auth = (req, res) => {
    var params = req.params;
    var query = req.query;
    var body = req.body;
    query.body = body;

    //TO DO : Authenticate request

    if (AUTH.requests.hasOwnProperty(params.request)) {
        AUTH.requests[params.request](query)
            .then(data => makeResponse(res, data, UTILITY.httpStatusCodes["OK"]))
            .catch(error => makeResponse(res, error, UTILITY.httpStatusCodes["Bad Request"]));
    }
}

exports.mat = (req, res) => {
    var params = req.params;
    var query = req.query;
    var body = req.body;
    query.body = body;

    if (MAT.requests.hasOwnProperty(params.request)) {
        MAT.requests[params.request](query)
            .then(data => makeResponse(res, data, UTILITY.httpStatusCodes["OK"]))
            .catch(error => makeResponse(res, error, UTILITY.httpStatusCodes["Bad Request"]));
    }
}

exports.player = (req, res) => {
    var params = req.params;
    var query = req.query;
    var body = req.body;
    query.body = body;

    if (PLAYER.requests.hasOwnProperty(params.request)) {
        PLAYER.requests[params.request](query)
            .then(data => makeResponse(res, data, UTILITY.httpStatusCodes["OK"]))
            .catch(error => makeResponse(res, error, UTILITY.httpStatusCodes["Bad Request"]));
    }
}