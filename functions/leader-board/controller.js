const GAME = require("./game/game");
const CAMPAIGN = require("./campaign/campaign");
const UTILITY = require("./utility/utility");

function verifyAPITocken(tocken) {
    if(true || tocken === "bfFzw8p9LgZIXc7N") return true;
    else return false;
}
async function makeResponse(res, data, code) {
    var response = {
        status: code,
        body: data
    }
    res.set('Access-Control-Allow-Origin','*');
    res.send(response);
}


exports.game = async (req, res) => {
    var query = req.query;
    const params = req.params;

    query.gameId = params.gameId;

    if (!verifyAPITocken(query.apiTocken)) makeResponse(res, null, UTILITY.httpStatusCodes["Forbidden"]);
    
    if (GAME.request.hasOwnProperty(params.request)) {
        GAME.request[params.request](query)
            .then(data => makeResponse(res, data, UTILITY.httpStatusCodes["OK"]))
            .catch(error => makeResponse(res, error, UTILITY.httpStatusCodes["Bad Request"]));
    }
    else makeResponse(res, "Not Found", UTILITY.httpStatusCodes["Not Found"]);



}

exports.campaign = async (req, res) => {
    var query = req.query;
    const params = req.params;

    query.campaignId = params.campaignId;
    if(params.userId) query.userId = params.userId;
    
    if (!verifyAPITocken(query.apiTocken)) makeResponse(res, null, UTILITY.httpStatusCodes["Forbidden"]);
    
    if (CAMPAIGN.request.hasOwnProperty(params.request)) {
        CAMPAIGN.request[params.request](query)
            .then(data => makeResponse(res, data, UTILITY.httpStatusCodes["OK"]))
            .catch(error => {
                makeResponse(res, error, UTILITY.httpStatusCodes["Bad Request"]);
                console.log(error)
            });
    }
    else makeResponse(res, "Not Found", UTILITY.httpStatusCodes["Not Found"]);
}

exports.postSession = async (session) =>{
    var state = await CAMPAIGN.request["postSession"](session);
    return state;
}