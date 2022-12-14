const UTILITY = require("../utility/utility");
const DEFS = require("../definations/definations");

const fgd = async (params) => {
    if (!params || !params.client) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "Client not found" };
    if (!params.query.gameId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "GameId not found" };
    if (!params.query.userId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "userId not found" };
    if (!params.query.playerId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "playerId not found" };

    if(params.method === "GET") return getFgd(params);
    else return { status: "error",statusCode: UTILITY.httpStatusCodes["Method Not Allowed"], message: "Method not allowed" };
}

const session = async (params) => {
    if (!params || !params.client) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "Client not found" };
    if (!params.query.gameId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "GameId not found" };
    if (!params.query.userId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "userId not found" };
    if (!params.query.playerId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "playerId not found" };

    if(params.method === "POST") return getSession(params);
    else return { status: "error",statusCode: UTILITY.httpStatusCodes["Method Not Allowed"], message: "Method not allowed" };
}


const getFgd = async (params) => {
    
    var response = {};
    
    let fgd = await UTILITY.database.fgd.read.fgd(params.query.gameId, params.query.userId, params.query.playerId);

    if(!fgd) response = { status: "error",statusCode: UTILITY.httpStatusCodes["Not Found"], message: "Fgd not found" };

    if(params.toString && params.toString === "true") response = { status: "success", statusCode : UTILITY.httpStatusCodes.OK, fgd: String(JSON.stringify(fgd)).replace(/\"/g, "'") };
    else response = { status: "success", statusCode : UTILITY.httpStatusCodes.OK, fgd: fgd };
    
    return response;
}

const postSession = async (params) => {}


exports.requests = {
    gameData  : fgd,
    sessionData : session
}