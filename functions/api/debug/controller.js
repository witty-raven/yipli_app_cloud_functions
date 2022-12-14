const AUTH = require("./auth/auth");
const VERSION = "v1.0";
const UTILITY = require("./utility/utility");
const DEFS = require("./definations/definations");


const requestHandler = async (req, res, method, cookie) => {
    if (method === "PUT" || method === "DELETE") 
        UTILITY.sendResponse(res, UTILITY.makeError("error", "Method not allowed"), UTILITY.httpStatusCodes["Method Not Allowed"]);
    
    let category = String(req.params.category).toLowerCase();
    console.log("Category",category);

    let request = String(req.params.request);

    let params = UTILITY.decodeParams(req) || {};

    console.log(category, "category", request, "request", params, "params", method, "method");
    console.log(req.body, "req.body");
    console.log(req.params, "req.params");
    params.body = req.body;
    params.query = req.query;
    params.method = method;
    console.log("hello");
    console.log(params, "params");
    const categoryModule = require(DEFS.categories[category]);
    // const categoryModule = require("./payments/pays");
    console.log("hey");
console.log(categoryModule,"categoryModule");
if (!categoryModule.requests.hasOwnProperty(request)) {
    
    UTILITY.sendResponse(res, UTILITY.makeError("error", "Request not found"), UTILITY.httpStatusCodes["Bad Request"]);
    return;
}
console.log("HII");
// console.log(categoryModule.requests[request](params),"categoryModule.requests");

    let requestModule = await categoryModule.requests[request](params);
console.log(requestModule,"requestMdoule");
    if (!requestModule.status) 
        return UTILITY.sendResponse(res, UTILITY.makeError("error", "Request not found"), UTILITY.httpStatusCodes["Bad Request"]);
    
    if (requestModule.status === "error") {
        UTILITY.sendResponse(res, UTILITY.makeError("error", requestModule.message), requestModule.statusCode);
        return;
    }
    
    var response = UTILITY.makeResponse("success", requestModule, params.client ? params.client : "unkown");
    
    // if(requestModule.status === 400){
        // return UTILITY.sendResponse(res, response, UTILITY.httpStatusCodes["Bad Request"]);
    // }

    return UTILITY.sendResponse(res, response, UTILITY.httpStatusCodes["OK"]);

}

const apiGet = async (req, res) => { // let tokenDecode = await AUTH.authenticate(req, res);
    let cookie = "";

    // if(!tokenDecode) UTILITY.sendResponse(res, UTILITY.makeError("error", "Invalid token"), UTILITY.httpStatusCodes["Unauthorized"]);
    // if(tokenDecode.status === "success"){
    //     if(cookie) cookie = tokenDecode.token;
    // }
    // else {
    //     UTILITY.sendResponse(res, UTILITY.makeError("error", tokenDecode.message), tokenDecode.statusCode);
    //     return;
    // }

    // if(UTILITY.validateAPIURL(req).status === "error") {
    //     UTILITY.sendResponse(res, UTILITY.makeError("error", UTILITY.validateAPIURL(req)).message, UTILITY.httpStatusCodes["Bad Request"]);
    //     return;
    // }
    // console.log(req,"Req");
    return requestHandler(req, res, "GET", cookie ? cookie : "");
}

const apiPost = async (req, res) => {
    
    let tokenDecode = await AUTH.authenticate(req, res);
    
    if (UTILITY.validateAPIURL(req).status === "error") {
        UTILITY.sendResponse(res, UTILITY.makeError("error", UTILITY.validateAPIURL(req)).message, UTILITY.httpStatusCodes["Bad Request"]);
        return;
    }
// console.log(requestHandler(req, res, "POST"),"request handler req,res");
    return requestHandler(req, res, "POST");
}

const apiPut = async (req, res) => { // let tokenDecode = await AUTH.authenticate(req, res);

    if (UTILITY.validateAPIURL(req).status === "error") {
        UTILITY.sendResponse(res, UTILITY.makeError("error", UTILITY.validateAPIURL(req)).message, UTILITY.httpStatusCodes["Bad Request"]);
        return;
    }

    return requestHandler(req, res, "PUT");
}

const apiDelete = async (req, res) => { // let tokenDecode = await AUTH.authenticate(req, res);

    if (UTILITY.validateAPIURL(req).status === "error") {
        UTILITY.sendResponse(res, UTILITY.makeError("error", UTILITY.validateAPIURL(req)).message, UTILITY.httpStatusCodes["Bad Request"]);
        return;
    }

    return requestHandler(req, res, "DELETE");
}


const apiController = {
    get: apiGet,
    post: apiPost,
    put: apiPut,
    delete: apiDelete
}


exports.request = apiController;
