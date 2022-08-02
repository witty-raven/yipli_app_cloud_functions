const AUTH  = require("./auth/auth");
const VERSION = "v1.0";
const UTILITY = require("./utility/utility");
const DEFS = require("./definations/definations");


const requestHandler = async(req, res, method) => { 

    if(method === "PUT" || method === "DELETE") UTILITY.sendResponse(res, UTILITY.makeError("error", "Method not allowed"), UTILITY.httpStatusCodes["Method Not Allowed"]);

    let category = req.params.category;
    let request = req.params.request;

    let params = UTILITY.decodeParams(req) || {};
    params.body = req.body;
    params.query = req.query;
    params.method = method;

    const categoryModule = require(DEFS.categories[category]);
    if(!categoryModule.requests.hasOwnProperty(request)){
        UTILITY.sendResponse(res, UTILITY.makeError("error", "Request not found"), UTILITY.httpStatusCodes["Bad Request"]);
        return;
    }
    let requestModule = await categoryModule.requests[request](params);
    if(requestModule.status === "error") {
        UTILITY.sendResponse(res, UTILITY.makeError("error", requestModule.message), requestModule.statusCode);
        return;
    }
    var response = UTILITY.makeResponse("success", requestModule, params.client);
    UTILITY.sendResponse(res, response, UTILITY.httpStatusCodes["OK"]);

}

const apiGet = async(req, res) => {
    let tokenDecode = await AUTH.authenticate(req, res);

    if(!tokenDecode || tokenDecode.status === "error") {
        console.log("Token not valid");
        res.send(tokenDecode);
        return;
    }

    if(UTILITY.validateAPIURL(req).status === "error") {
        UTILITY.sendResponse(res, UTILITY.makeError("error", UTILITY.validateAPIURL(req)).message, UTILITY.httpStatusCodes["Bad Request"]);
        return;
    }

    return requestHandler(req, res, "GET");
}

const apiPost = async(req, res) => {
    let tokenDecode = await AUTH.authenticate(req, res);

    if(!tokenDecode || tokenDecode.status === "error") {
        console.log("Token not valid");
        res.send(tokenDecode);
        return;
    }

    if(UTILITY.validateAPIURL(req).status === "error") {
        UTILITY.sendResponse(res, UTILITY.makeError("error", UTILITY.validateAPIURL(req)).message, UTILITY.httpStatusCodes["Bad Request"]);
        return;
    }

    return requestHandler(req, res, "POST");
}

const apiPut = async(req, res) => {
    // let tokenDecode = await AUTH.authenticate(req, res);

    // if(!tokenDecode || tokenDecode.status === "error") {
    //     console.log("Token not valid");
    //     res.send(tokenDecode);
    //     return;
    // }

    if(UTILITY.validateAPIURL(req).status === "error") {
        UTILITY.sendResponse(res, UTILITY.makeError("error", UTILITY.validateAPIURL(req)).message, UTILITY.httpStatusCodes["Bad Request"]);
        return;
    }

    return requestHandler(req, res, "PUT");
}

const apiDelete = async(req, res) => {
    // let tokenDecode = await AUTH.authenticate(req, res);

    // if(!tokenDecode || tokenDecode.status === "error") {
    //     console.log("Token not valid");
    //     res.send(tokenDecode);
    //     return;
    // }

    if(UTILITY.validateAPIURL(req).status === "error") {
        UTILITY.sendResponse(res, UTILITY.makeError("error", UTILITY.validateAPIURL(req)).message, UTILITY.httpStatusCodes["Bad Request"]);
        return;
    }

    return requestHandler(req, res, "DELETE");
}



const apiController = {
    get : apiGet,
    post : apiPost,
    put : apiPut,
    delete : apiDelete
}



exports.request = apiController;