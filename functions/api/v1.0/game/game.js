const UTILITY = require("../utility/utility");
const DEFS = require("../definations/definations");


const gameDetails = async (params) => {
    if (!params || !params.client) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "Client not found" };
    if (!params.query.gameId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "GameId not found" };

    var response = {};

    if (params.method === "GET") response = await getGameDetails(params);
    else if (params.method === "POST") response = await updateGameDetails(params);
    else if (params.method === "DELETE") response = await removeGameDetails(params);

    return response || { status: "error",statusCode: UTILITY.httpStatusCodes["No Content"], message: "Request not processed" };
}

const getGameDetails = async (params) => {
    let gameId = params.query.gameId;
    let gameDetailsList = String(params.query.details).split(",") || [];

    if (UTILITY.isEmpty(gameId, "string") || UTILITY.isEmpty(gameDetailsList, "array")) {
        return { status: "error", message: "GameId or details not found" };
    }

    let gameDetailsPromises = [];

    for (let i = 0; i < gameDetailsList.length; i++) {
        let gameDetails = gameDetailsList[i];
        if (getGameDetailsList.hasOwnProperty(gameDetails)) {
            gameDetailsPromises.push(getGameDetailsList[gameDetails](gameId, params));
        }
    }

    let gameDetailsObj = await Promise.all(gameDetailsPromises);
    let gameDetails = {};
    for (let i = 0; i < gameDetailsObj.length; i++) {;
        if (gameDetailsObj[i].status === "error") gameDetails[gameDetailsList[i]] = "NA";
        else gameDetails[gameDetailsList[i]] = gameDetailsObj[i][gameDetailsList[i]];
    }

    let response = { status: "success", message: "Game details",items : "gameDetails", gameDetails: gameDetails };
    return response;
}
const updateGameDetails = async (params) => {}
const removeGameDetails = async (params) => {}



async function getGameName(gameId, params) {
    let gameName = await UTILITY.database.game.read.name(gameId);
    return { status: "success", name: gameName };
}
async function getGameVersions(gameId, params) {
    let gameVersions = await UTILITY.database.game.read.versions(gameId);
    if(params.platform){
        let _gameVersions = {};
        _gameVersions["latest"] = (gameVersions.latest[params.platform]);
        _gameVersions["minimum"] = (gameVersions.minimum[params.platform]);
        return { status: "success", versions: _gameVersions };
    }
    else{
        return { status: "success", versions: gameVersions };
    }
    
}
async function getGameDescription(gameId, params) {
    let gameDescription = await UTILITY.database.game.read.description(gameId);
    return { status: "success", description: gameDescription };
}
async function getGameDynamicLink(gameId, params) {
    let gameDynamicLink = await UTILITY.database.game.read.dynamicLink(gameId);
    return { status: "success", dynamicLink: gameDynamicLink };
}
async function getGameMode(gameId, params) {
    let gameMode = await UTILITY.database.game.read.mode(gameId);
    return { status: "success", mode: gameMode };
}
async function getGameType(gameId, params) {
    let gameType = await UTILITY.database.game.read.type(gameId);
    return { status: "success", type: gameType };
}
async function getGameUrls(gameId, params) {
    let gameUrls = await UTILITY.database.game.read.urls(gameId);
    if(params.platform){
        let gameUrl = gameUrls[params.platform];
        return { status: "success", urls: gameUrl };
        
    }
    else return { status: "success", urls: gameUrls };
}
async function getGameInfo(gameId, params) {
    let gameInfo = await UTILITY.database.game.read.info(gameId);
    return { status: "success", info: gameInfo };
}
async function getWrks(gameId, params) {
    let gameWrks = await UTILITY.database.game.read.Wrks(gameId);
    return { status: "success", wrk: gameWrks };
}



const getGameDetailsList = {
    "name" : getGameName,
    "versions" : getGameVersions,
    "description" : getGameDescription,
    "dynamicLink" : getGameDynamicLink,
    "mode" : getGameMode,
    "type" : getGameType,
    "urls" : getGameUrls,
    "info" : getGameInfo,
    "wrk" : getWrks
}

exports.requests = {
    details : gameDetails
}