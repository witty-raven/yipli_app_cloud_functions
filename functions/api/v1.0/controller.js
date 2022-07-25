const AUTH  = require("./auth/auth");
const VERSION = "v1.0";
const UTILITY = require("./utility/utility");
const DEFS = require("./definations/definations");


const apiGet = async(req, res) => { 

    // let tokenDecode = await AUTH.authenticate(req, res);

    // if(!tokenDecode || tokenDecode.status === "error") {
    //     console.log("Token not valid");
    //     res.send(tokenDecode);
    //     return;
    // }

    let category = req.params.category;
    let request = req.params.request;

    if(UTILITY.validateAPIURL(req).status === "error") {
        res.send(UTILITY.validateAPIURL(req));
        return;
    }

    let params = UTILITY.decodeParams(req) || {};
    params.body = req.body;
    params.query = req.query;
    params.method = req.method;

    const categoryModule = require(DEFS.categories[category]);
    if(!categoryModule.requests.hasOwnProperty(request)){
        res.send(UTILITY.makeError("error", "Request not found", params.client, params.platform));
        return;
    }
    let requestModule = await categoryModule.requests[request](params);
    if(requestModule.status === "error") {
        res.send(UTILITY.makeError("error", requestModule.message, params.client, params.platform));
        return;
    }
    var response = UTILITY.makeResponse("success", requestModule, params.client, params.platform);
    UTILITY.sendResponse(res, response);

}

const apiPost = async(req, res) => {
    // let tokenDecode = await AUTH.authenticate(req, res);

    // if(!tokenDecode || tokenDecode.status === "error") {
    //     console.log("Token not valid");
    //     res.send(tokenDecode);
    //     return;
    // }

    let category = req.params.category;
    let request = req.params.request;

    console.log(req.params);

    if(UTILITY.validateAPIURL(req).status === "error") {
        res.send(UTILITY.validateAPIURL(req));
        return;
    }

    let params = UTILITY.decodeParams(req) || {};
    params.body = req.body;
    params.query = req.query;
    params.method = req.method;

    const categoryModule = require(DEFS.categories[category]);
    if(!categoryModule.requests.hasOwnProperty(request)){
        res.send(UTILITY.makeError("error", "Request not found", params.client, params.platform));
        return;
    }
    let requestModule = await categoryModule.requests[request](params);
    if(requestModule.status === "error") {
        res.send(UTILITY.makeError("error", requestModule.message, params.client, params.platform));
        return;
    }
    var response = UTILITY.makeResponse("success", requestModule, params.client, params.platform);
    UTILITY.sendResponse(res, response);
}

const apiPut = async(req, res) => {
    await AUTH.authenticate(req, res);

    let category = req.params.category;
    let request = req.params.request;
    let support = req.params.support;
}

const apiDelete = async(req, res) => {
    await AUTH.authenticate(req, res);

    let category = req.params.category;
    let request = req.params.request;
    let support = req.params.support;
}



const apiController = {
    get : apiGet,
    post : apiPost,
    put : apiPut,
    delete : apiDelete
}



exports.request = apiController;