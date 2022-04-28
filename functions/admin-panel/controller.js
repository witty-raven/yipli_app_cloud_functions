const UTILITY = require("./utility/utility");
const USER = require("./user/user");
const PRODUCT = require("./product/product");
const USAGE = require("./usage/usage");
const GAME = require("./game/game");


function verifyAPITocken(tocken) {
    if (tocken === "bfFzw8p9LgZIXc7N") return true;
    else return false;
}
async function makeResponse(res, data, code) {
    var response = {
        status: code,
        body: data
    }
    res.send(response);
}


exports.user = async (req, res) => {
    const query = req.query;
    const params = req.params;

    if (!verifyAPITocken(query.apiTocken)) makeResponse(res, null, UTILITY.httpStatusCodes["Forbidden"]);

    if (USER.request.hasOwnProperty(params.request)) {
        USER.request[params.request](query)
            .then(data => makeResponse(res, data, UTILITY.httpStatusCodes["OK"]))
            .catch(error => makeResponse(res, error, UTILITY.httpStatusCodes["Bad Request"]));
    }
    else makeResponse(res, "Not Found", UTILITY.httpStatusCodes["Not Found"]);



}

exports.product = async (req, res) => {
    const query = req.query;
    const params = req.params;

    if (!verifyAPITocken(query.apiTocken)) makeResponse(res, null, UTILITY.httpStatusCodes["Forbidden"]);

    if (PRODUCT.request.hasOwnProperty(params.request)) {
        PRODUCT.request[params.request](query)
            .then(data => makeResponse(res, data, UTILITY.httpStatusCodes["OK"]))
            .catch(error => makeResponse(res, error, UTILITY.httpStatusCodes["Bad Request"]));
    }
    else makeResponse(res, "Not Found", UTILITY.httpStatusCodes["Not Found"]);
}

exports.usage = async (req, res) => {
    const query = req.query;
    const params = req.params;

    if (!verifyAPITocken(query.apiTocken)) makeResponse(res, null, UTILITY.httpStatusCodes["Forbidden"]);

    if (USAGE.request.hasOwnProperty(params.request)) {
        USAGE.request[params.request](query)
            .then(data => makeResponse(res, data, UTILITY.httpStatusCodes["OK"]))
            .catch(error => makeResponse(res, error, UTILITY.httpStatusCodes["Bad Request"]));
    }
    else makeResponse(res, "Not Found", UTILITY.httpStatusCodes["Not Found"]);
}

exports.game = async (req, res) => {
    const query = req.query;
    const params = req.params;

    if (!verifyAPITocken(query.apiTocken)) makeResponse(res, null, UTILITY.httpStatusCodes["Forbidden"]);

    if (GAME.request.hasOwnProperty(params.request)) {
        GAME.request[params.request](query)
            .then(data => makeResponse(res, data, UTILITY.httpStatusCodes["OK"]))
            .catch(error => makeResponse(res, error, UTILITY.httpStatusCodes["Bad Request"]));
    }
    else makeResponse(res, "Not Found", UTILITY.httpStatusCodes["Not Found"]);
}