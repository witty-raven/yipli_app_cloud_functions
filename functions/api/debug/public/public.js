const firebase = require("firebase-admin");
const db = firebase.database();

const UTILITY = require("../utility/utility");



async function getURLs(params) {
    if(!params || !params.platform) return {status : "error", message : "Platform not found"};
    if(!params.query.urls) return {status : "error", message : "URLs not found"};

    let urls = params.query.urls.split(",");

    let urlList = [];
    for(let i = 0; i < urls.length; i++) {
 
    }

    return{ "status": "success", "message": "URLs", "url": urlList };

}

async function connectionCheck(params) {
    //Send All Available Data related to the connection
    return { "status": "success", "message": "Connection check" };
}

async function submitFCMToken(params) {
    if(!params || !params.client) return {status : "error", message : "Client not found"};
    if(!params.body.fcmToken) return {status : "error", message : "Token not found"};
    if(params.method !== "POST") return {status : "error", message : "Method not allowed"};


    let token = params.body.fcmToken;
    let userId = params.query.userId || "";
    let deviceInfo = params.body.deviceInfo || {};
    params.deviceInfo = deviceInfo;


    if(params.mode === "add"){
        var fcmTokenNode = UTILITY.database.public.write.saveFCMToken(token,userId,params);
        if(!fcmTokenNode) return {status : "error", message : "Token not saved"};
        return {status : "success", message : "Token saved"};
    }
    else if(params.mode === "remove"){
        return {status : "not-implemented", message : "Token removal not implemented"};
        // var fcmTokenNode = UTILITY.database.public.write.removeFCMToken(token,userId,params);
        // if(!fcmTokenNode) return {status : "error", message : "Token not removed"};
        // return {status : "success", message : "Token removed"};
    }
    else if (params.mode === "update") {
        var fcmTokenNode = UTILITY.database.public.write.updateFCMToken(token,userId,params);
        if(!fcmTokenNode) return {status : "error", message : "Token not updated"};
        return {status : "success", message : "Token updated"};
    }
    else{
        return {status : "error", message : "Mode not found"};
    }
}

exports.requests = {
    urls : getURLs,
    isAlive : connectionCheck,
    fcmToken : submitFCMToken
}