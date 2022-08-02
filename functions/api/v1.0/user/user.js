const UTILITY = require("../utility/utility");
const DEFS = require("../definations/definations");

const userDetails = async (params) => {
    if (!params || !params.client) return { status: "error", statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "Client not found" };
    if (!params.query.userId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "UserId not found" };

    var response = {};

    if (params.method === "GET") response = await getUserDetails(params);
    else if (params.method === "POST") response = await updateUserDetails(params);
    else if (params.method === "DELETE") response = await removeUserDetails(params);

    return response || { status: "error", statusCode: UTILITY.httpStatusCodes["No Content"], message: "Request not processed" };
}
const getUserDetails = async (params) => {
    let userId = params.query.userId;
    if(UTILITY.isEmpty(params.query.details, "string") || UTILITY.isEmpty(userId, "string")) return { status: "error", statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "UserId or details not found" };
    let userDetailsList = String(params.query.details).split(",") || [];

    if(UTILITY.isEmpty(userId, "string") || UTILITY.isEmpty(userDetailsList, "array")) {
        return { status: "error", message: "UserId or details not found" };
    }


    let userDetailsPromises = [];

    for (let i = 0; i < userDetailsList.length; i++) {
        let userDetails = userDetailsList[i];
        if (getUserDetailsList.hasOwnProperty(userDetails)) {
            userDetailsPromises.push(getUserDetailsList[userDetails](userId, params));
        }
    }

    let userDetailsObj = await Promise.all(userDetailsPromises);
    let userDetails = {};
    for (let i = 0; i < userDetailsObj.length; i++) {
        if(userDetailsObj[i].status === "error") userDetails[userDetailsList[i]] = "NA"; 
        else userDetails[userDetailsList[i]] = userDetailsObj[i][userDetailsList[i]]; 
    }

    let response = { status: "success", message: "User Details", items : "userDetails", userDetails: userDetails };
    return response;
}
const updateUserDetails = async (params) => {

}
const removeUserDetails = async (params) => {

}

const userStats = async (params) => {
    if (!params || !params.client) return { status: "error", statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "Client not found" };
    if (!params.query.userId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "UserId not found" };

    var response = {};

    if (params.method === "GET") response = await getUserStats(params);
    else if (params.method === "POST") response = await updateUserStats(params);
    else if (params.method === "DELETE") response = await removeUserStats(params);

    return response || { status: "error", statusCode: UTILITY.httpStatusCodes["No Content"], message: "Request not processed" };
}
const getUserStats = async (params) => {

}
const updateUserStats = async (params) => {

}
const removeUserStats = async (params) => {

}


const userGameProgress = async (params) => {
    if (!params || !params.client) return { status: "error", statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "Client not found" };
    if (!params.query.userId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "UserId not found" };

    var response = {};

    if (params.method === "GET") response = await getUserGameProgress(params);
    else if (params.method === "POST") response = await updateUserGameProgress(params);
    else if (params.method === "DELETE") response = await removeUserGameProgress(params);

    return response || { status: "error", statusCode: UTILITY.httpStatusCodes["No Content"], message: "Request not processed" };
}
const getUserGameProgress = async (userId, params) => {

}
const updateUserGameProgress = async (userId, params) => {

}
const removeUserGameProgress = async (userId, params) => {

}



const getUserId = async (userId, params) => {

}
const getUserName = async (userId, params) => {
    let userName = await UTILITY.database.user.read.name(userId);
    if(UTILITY.isEmpty(userName, "string")) return { status: "error", name: "User name not found" };
    return { status: "success", name: userName };
}
const getUserEmail = async (userId, params) => {
    let userEmail = await UTILITY.database.user.read.email(userId);
    if(UTILITY.isEmpty(userEmail, "string")) return { status: "error", email: "User email not found" };
    return { status: "success", email: userEmail };
}
const getUserPhone = async (userId, params) => {
    let userPhone = await UTILITY.database.user.read.phone(userId);
    if(UTILITY.isEmpty(userPhone, "string")) return { status: "error", phone: "User phone not found" };
    return { status: "success", phone: userPhone };
}
const getUserAddress = async (userId, params) => {

}
const getUserProfilePic = async (userId, params) => {
    let userProfilePic = await UTILITY.database.user.read.userProfilePic(userId);
    if(UTILITY.isEmpty(userProfilePic, "string")) return { status: "error", familyProfilePic: "User profile pic not found" };
    return { status: "success", familyProfilePic: userProfilePic };
}
const getUserPlayers = async (userId, params) => {
    let userPlayers = await UTILITY.database.user.read.players(userId);
    if(UTILITY.isEmpty(userPlayers, "array")) return { status: "error", players: "User players not found" };
    return { status: "success", players: userPlayers };
}
const getUserPlayerIds = async (userId, params) => {
    let userPlayerIds = await UTILITY.database.user.read.playerIds(userId);
    if(UTILITY.isEmpty(userPlayerIds, "array")) return { status: "error", playerNames: "User player ids not found" };
    return { status: "success", playerIds: userPlayerIds };
}
const getUserPlayerNames = async (userId, params) => {
    let getUserPlayerNames = await UTILITY.database.user.read.playerNames(userId, []);
    if(UTILITY.isEmpty(getUserPlayerNames, "array")) return { status: "error", playerNames: "User player names not found" };
    return { status: "success", playerNames: getUserPlayerNames };

}
const getUserPlayerProfilePics = async (userId, params) => {
    let userPlayerProfilePics = await UTILITY.database.user.read.playerProfilePics(userId, []);
    if(UTILITY.isEmpty(userPlayerProfilePics, "array")) return { status: "error", playerProfilePics: "User player profile pics not found" };
    return { status: "success", playerProfilePics: userPlayerProfilePics };
}
const getUserCurrentMatId = async (userId, params) => {
    let userCurrentMatId = await UTILITY.database.user.read.currentMatId(userId);
    if(UTILITY.isEmpty(userCurrentMatId, "string")) return { status: "error", currentMatId: "User current mat id not found" };
    return { status: "success", currentMatId: userCurrentMatId };
}
const getUserCurrentMat = async (userId, params) => {
    let currentMatId = await UTILITY.database.user.read.currentMatId(userId);
    if(UTILITY.isEmpty(currentMatId, "string")) return { status: "error", currentMat: "User current mat not found" };
    let currentMat = await UTILITY.database.mat.read.mat(currentMatId, userId);
    if(UTILITY.isEmpty(currentMat, "object")) return { status: "error", currentMat: "User current mat not found" };
    return { status: "success", currentMat: currentMat };
}
const getUserCurrentMatName = async (userId, params) => {
    let currentMatId = await UTILITY.database.user.read.currentMatId(userId);
    if(UTILITY.isEmpty(currentMatId, "string")) return { status: "error", currentMatName: "User current mat name not found" };
    let currentMatName = await UTILITY.database.mat.read.name(currentMatId);
    if(UTILITY.isEmpty(currentMatName, "string")) return { status: "error", currentMatName: "User current mat name not found" };
    return { status: "success", currentMatName: currentMatName };
}
const getUserMatRegisteredOn = async (userId, params) => {
    let matId = params.matId || await UTILITY.database.user.read.currentMatId(userId);
    if(UTILITY.isEmpty(matId, "string")) return { status: "error", matRegisteredOn: "User mat registered on not found" };
    let matRegisteredOn = await UTILITY.database.mat.read.registeredOn(matId, userId);
    if(UTILITY.isEmpty(matRegisteredOn, "string")) return { status: "error", matRegisteredOn: "User mat registered on not found" };
    return { status: "success", matRegisteredOn: matRegisteredOn };
}

const updateUserName = async (userId, params) => {

}
const updateUserEmail = async (userId, params) => {

}
const updateUserPhone = async (userId, params) => {

}
const updateUserAddress = async (userId, params) => {

}
const updateUserProfilePic = async (userId, params) => {

}
const updateUserPlayers = async (userId, params) => {

}
const updateUserPlayerIds = async (userId, params) => {

}
const updateUserPlayerNames = async (userId, params) => {

}
const updateUserPlayerProfilePics = async (userId, params) => {

}
const updateUserCurrentMatId = async (userId, params) => {

}
const updateUserCurrentMat = async (userId, params) => {

}
const updateUserCurrentMatName = async (userId, params) => {

}


const getUserDetailsList = {
    "userId": getUserId,
    "name": getUserName,
    "email": getUserEmail,
    "phone": getUserPhone,
    "address": getUserAddress,
    "familyProfilePic" : getUserProfilePic,
    "players": getUserPlayers,
    "playerIds": getUserPlayerIds,
    "playerNames": getUserPlayerNames,
    "playerProfilePics": getUserPlayerProfilePics,
    "currentMatId": getUserCurrentMatId,
    "currentMat": getUserCurrentMat,
    "currentMatName": getUserCurrentMatName,
    "matRegisteredOn": getUserMatRegisteredOn
}
const updateUserDetailsList = {
    "name": updateUserName,
    "email": updateUserEmail,
    "phone": updateUserPhone,
    "address": updateUserAddress,
    "familyProfilePic" : updateUserProfilePic,
    "players": updateUserPlayers,
    "playerIds": updateUserPlayerIds,
    "playerNames": updateUserPlayerNames,
    "playerProfilePics": updateUserPlayerProfilePics,
    "currentMatId": updateUserCurrentMatId,
    "currentMat": updateUserCurrentMat,
    "currentMatName": updateUserCurrentMatName,
}

const getUserStatsList = {
    
}
const updateUserStatsList = {

}

const getUserGameProgressList = {

}
const updateUserGameProgressList = {

}



exports.requests = {
    details: userDetails,
    stats : userStats,
    gameProgress: userGameProgress
}
