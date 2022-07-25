const firebase = require("firebase-admin");
const db = firebase.database();




const makeResponseForApp = (status, data) => {
    if(!data.items || !data.items.split(",").length) makeError("error", "Empty Response", "app");
    return data;
}

const makeResponseForGame = (status, data) => {
    if(!data.items || !data.items.split(",").length) makeError("error", "Empty Response", "game");
    let response = {};
    response.status = data.status;
    response.message = data.message;
    response.items = data.items;
    let dataList = data.items.split(",");
    dataList.forEach((item, index) => {
        for(let key in data[item]){
            response[key] = data[item][key];
        }
    })

    return response;
}

const makeResponseForWeb = (status, data) => {
    if(!data.items || !data.items.split(",").length) makeError("error", "Empty Response", "web");
    return data;
}

const responcePackager = {
    app : makeResponseForApp,
    game : makeResponseForGame,
    web : makeResponseForWeb,
}

const makeResponse = (status, data, client) => {
    if(!status || !data) return makeError("error", "Invalid response", client);
    if(responcePackager.hasOwnProperty(client)){
        return responcePackager[client](status, data);
    }

}

const makeError = (status, message, client) => {
    return { status: status, message: message };
}

const sendResponse = (res, message) => {
    res.send(message);
}


exports.makeResponse = makeResponse;
exports.makeError = makeError;
exports.sendResponse = sendResponse;

exports.authAccessCategoryList = require("./accessScemas/authAccessCategoryList.json");

exports.validateAPIURL = (req) => {

    let category = req.params.category;
    let request = req.params.request;

    const DEFS = require("../definations/definations");


    if (!category || DEFS.categories.hasOwnProperty(category) === false) return { status: "error", message: "Category not found" };
    if (!request || !DEFS.categoryRequests[category].includes(request)) return { status: "error", message: "Request not valid" };

    return { status: "success", message: "Valid URL" };
}

exports.decodeParams = (req) => {
    let support = req.params.support;
    let params = {};
    if (!support || String(support).substring(0, 1) !== "~") return null;
    let supportList = support.split("~");
    for (let i = 1; i < supportList.length; i++) {
        let param = supportList[i].split("=");
        params[param[0]] = param[1];
    }
    return params;
}

exports.platforms = {
    android: "a",
    ios: "i",
    windows: "w",
    androidTV: "atv",
    macOS: "m"
}

exports.makeURL = (url, params) => {
    let urlString = url;
    for (let key in params) {
        urlString = urlString.replace(`{${key}}`, params[key]);
    }
    return urlString;
}

const isEmpty = (obj, type) => {
    if (type === "object") {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) return true;
        }
        return false;
    }
    if (type === "array") {
        return obj.length === 0;
    }
    if (type === "string") {
        if (obj === "") return true;
        else if (obj === null) return true;
        else if (obj === undefined) return true;
        else return false;
    }
    return false;
}
exports.isEmpty = isEmpty;

const baseUrls = {
    storage : "https://firebasestorage.googleapis.com/v0/b/yipli-project.appspot.com/o/"
}

const mediaType = {
    'text' : "?alt=text",
    'media' : "?alt=media"
}

const constructPublicURL = (baseUrl, path, mediaType)=>{
    if(!baseUrl || !path || !mediaType) return null;
    const encodedPath = String(path).replace(/\//g, "%2F");
    return (baseUrl + encodedPath + mediaType);
}

const databsePaths = {
    userProfile: "profiles/users/",
    userStats: "/user-stats/",
    sessions: "/sessions/game-sessions/",
    inventory: "/inventory/",
    leaderBoards: "/leader-boards/",
    profilePicStoragePath : "profile-pics/",
    gameIconStoragePath : "game-icons/",
    fcmTokensNew: "/trial/fcm-tokens-new/",
}


exports.database = {
    user: {
        read: {
            name: async (userId) => {
                let ref = await db.ref(databsePaths.userProfile + userId + "/display-name").once("value");
                return ref.val();
            },
            email: async (userId) => {
                let ref = await db.ref(databsePaths.userProfile + userId + "/email").once("value");
                return ref.val();
            },
            phone: async (userID) => {
                let ref = await db.ref(databsePaths.userProfile + userID + "/contact-no").once("value");
                return ref.val();
            },
            userProfilePic : async (userId) => {
                let ref = await db.ref(databsePaths.userProfile + userId + "/profile-pic-url").once("value");
                if(isEmpty(ref.val(), "string")) return constructPublicURL(baseUrls.storage, databsePaths.profilePicStoragePath +"placeholder_image.png", mediaType.media);
                const url = constructPublicURL(baseUrls.storage, databsePaths.profilePicStoragePath + ref.val(), mediaType.media);
                return url;
            },
            players: async (userId) => {
                let ref = await db.ref(databsePaths.userProfile + userId + "/players").once("value");
                let players = [];
                // if(isEmpty(ref.val(), "object")) return players;
                for(let key in ref.val()){
                    let player = {
                        playerId : key,
                        name : ref.val()[key].name,
                        addedOn : ref.val()[key]["added-on"],
                        matTutDone : ref.val()[key]["mat-tut-done"],
                        dob : ref.val()[key].dob,
                        gender : ref.val()[key].gender,
                        height : ref.val()[key].height,
                        profilePicUrl : ref.val()[key]["profile-pic-url"] ? constructPublicURL(baseUrls.storage, databsePaths.profilePicStoragePath + ref.val()[key]["profile-pic-url"], mediaType.media) : constructPublicURL(baseUrls.storage, databsePaths.profilePicStoragePath + "placeholder_image.png", mediaType.media),
                        weight : ref.val()[key].weight,
                        userId : userId
                    }
                    players.push(player);
                }
                return players;
            },
            playerIds: async (userId) => {
                let ref = await db.ref(databsePaths.userProfile + userId + "/players").once("value");
                let playerIds = [];
                ref.forEach(player => {
                    playerIds.push(player.key);
                })
                return playerIds;
            },
            playerNames: async (userId, playerIds) => {
                if (!playerIds || playerIds.length === 0) {
                    let ref = await db.ref(databsePaths.userProfile + userId + "/players").once("value");
                    let playerNames = {};
                    ref.forEach(player => {
                        playerNames[player.key] = player.val().name;
                    })
                    return playerNames;
                }
                else {
                    let playerNamePromises = [];
                    for (let i = 0; i < playerIds.length; i++) {
                        playerNamePromises.push(db.ref(databsePaths.userProfile + userId + "/players/" + playerIds[i] + "/name").once("value"));
                    }
                    await Promise.all(playerNamePromises);
                    let playerNames = {};
                    for (let i = 0; i < playerNamePromises.length; i++) {
                        playerNames[playerIds[i]] = playerNamePromises[i].val();
                    }
                    return playerNames;
                }

            },
            playerProfilePics: async (userId, playerIds) => {
                if (!playerIds ||playerIds.length === 0) {
                    let ref = await db.ref(databsePaths.userProfile + userId + "/players").once("value");
                    let playerProfilePics = {};
                    ref.forEach(player => {
                        if(isEmpty(player.val().profilePicUrl, "string")) playerProfilePics[player.key] = constructPublicURL(baseUrls.storage, databsePaths.profilePicStoragePath + "placeholder_image.png", mediaType.media);
                        let url = constructPublicURL(baseUrls.storage, databsePaths.profilePicStoragePath + player.val()["profile-pic-url"], mediaType.media);
                        playerProfilePics[player.key] = url;
                    })
                    return playerProfilePics;
                }
                else {
                    let playerProfilePicPromises = [];
                    for (let i = 0; i < playerIds.length; i++) {
                        playerProfilePicPromises.push(db.ref(databsePaths.userProfile + userId + "/players/" + playerIds[i] + "/profile-pic-url").once("value"));
                    }
                    let playerProfilePic =  await Promise.all(playerProfilePicPromises);
                    let playerProfilePics = {};
                    for (let i = 0; i < playerProfilePicPromises.length; i++) {
                        let url = constructPublicURL(baseUrls.storage, databsePaths.profilePicStoragePath + playerProfilePic, mediaType.media);
                        playerProfilePics[playerIds[i]] = url;
                    }
                    return playerProfilePics;
                }

            },
            currentMatId : async (userId) => {
                let ref = await db.ref(databsePaths.userProfile + userId + "/current-mat-id").once("value");
                return ref.val();
            },
        }
    },
    mat : {
        read : {
            name : async (matId, userId) => {
                let ref = await db.ref(databsePaths.userProfile + userId + "/mats/"+ matId +"/display-name").once("value");
                return ref.val();
            },
            mac : async (matId, userId) => {
                let ref = await db.ref(databsePaths.userProfile + userId + "/mats/"+ matId +"/mac-address").once("value");
                return ref.val();
            },
            macName : async (matId, userId) => {
                let ref = await db.ref(databsePaths.userProfile + userId + "/mats/"+ matId +"/mac-name").once("value");
                return ref.val();
            },
            registeredOn : async (matId, userId) => {
                let ref = await db.ref(databsePaths.userProfile + userId + "/mats/"+ matId +"/registered-on").once("value");
                return ref.val();
            }
        }
    },
    game : {
        read : {
            name : async (gameId) => {
                let ref = await await db.ref(databsePaths.inventory + "games/" + gameId + "/name").once("value")
                return ref.val();
            },
            versions : async (gameId) => {
                var versionList = {
                    latest : {
                        a : await db.ref(databsePaths.inventory + "games/" + gameId + "/current-version").once("value"),
                        i : await db.ref(databsePaths.inventory + "games/" + gameId + "/ios-current-version").once("value"),
                        w : await db.ref(databsePaths.inventory + "games/" + gameId + "/win-version").once("value"),
                    },
                    minimum : {
                        a : await db.ref(databsePaths.inventory + "games/" + gameId + "/android-min-version").once("value"),
                        i : await db.ref(databsePaths.inventory + "games/" + gameId + "/ios-min-version").once("value"),
                        w : await db.ref(databsePaths.inventory + "games/" + gameId + "/win-min-version").once("value"),
                    }
                }
                return versionList;
            },
            description : async (gameId) => {
                let ref = await db.ref(databsePaths.inventory + "games/" + gameId + "/description").once("value");
                return ref.val();
            },
            dynamicLink : async (gameId) => {
                let ref = await db.ref(databsePaths.inventory + "games/" + gameId + "/dynamic-link").once("value");
                return ref.val();
            },
            mode : async (gameId) => {
                let ref = await db.ref(databsePaths.inventory + "games/" + gameId + "/mode").once("value");
                return ref.val();
            },
            type : async (gameId) => {
                let ref = await db.ref(databsePaths.inventory + "games/" + gameId + "/type").once("value");
                return ref.val();
            },
            urls : async (gameId) => {
                var urlList = {
                    a : await db.ref(databsePaths.inventory + "games/" + gameId + "/android-url").once("value"),
                    i : await db.ref(databsePaths.inventory + "games/" + gameId + "/ios-url").once("value"),
                }
                return urlList;
            },
            info : async (gameId) => {
                var IconImageName = await db.ref(databsePaths.inventory + "games/" + gameId + "/icon-img-url").once("value");
                var IconImageUrl = constructPublicURL(baseUrls.storage, databsePaths.gameIconStoragePath + IconImageName.val(), mediaType.media);
                let gameInfo = {
                    name : await db.ref(databsePaths.inventory + "games/" + gameId + "/name").once("value"),
                    description : await db.ref(databsePaths.inventory + "games/" + gameId + "/description").once("value"),
                    headingTitle : await db.ref(databsePaths.inventory + "games/" + gameId + "/heading-title").once("value"),
                    displayPriority : await db.ref(databsePaths.inventory + "games/" + gameId + "/display-priority").once("value"),
                    mode : await db.ref(databsePaths.inventory + "games/" + gameId + "/mode").once("value"),
                    type : await db.ref(databsePaths.inventory + "games/" + gameId + "/type").once("value"),
                    intensityLevel : await db.ref(databsePaths.inventory + "games/" + gameId + "/intensity-level").once("value"),
                    isGameUnderMaintanence : await db.ref(databsePaths.inventory + "games/" + gameId + "/is-game-under-maintenance").once("value"),
                    maintanenceMessage : await db.ref(databsePaths.inventory + "games/" + gameId + "/maintenance-message").once("value"),
                    osListForMaintanence : await db.ref(databsePaths.inventory + "games/" + gameId + "/os-list-for-maintanence").once("value"),
                    daysBeforeNextUpdatePrompt : await db.ref(databsePaths.inventory + "games/" + gameId + "/days-before-next-update-prompt").once("value"),
                    onlyMatPlayMode : await db.ref(databsePaths.inventory + "games/" + gameId + "/only-mat-play-mode").once("value"),
                    iconImageUrl : IconImageUrl,
                }
                return gameInfo;
            }
        }
    },
    public : {
        read : {},
        write : {
            saveFCMToken : async (fcmToken, userId, params) => {
                let fcmTokenNode = {
                    token : fcmToken,
                    timestamp : Date.now(),
                    userId : userId,
                    valid : true,
                    platform : params.body.platform,
                    "app-version" : params.appVersion || "",
                    "device-info" : {
                        "os" : params.deviceInfo.os,
                        "os-version" : params.deviceInfo.osVersion || "",
                        "device-model" : params.deviceInfo.deviceModel || "",
                        "device-manufacturer" : params.deviceInfo.deviceManufacturer || "",
                        "device-brand" : params.deviceInfo.deviceBrand || "",
                        "device-id" : params.deviceInfo.deviceId || "",
                    }
                }
                await db.ref(databsePaths.fcmTokensNew + String(fcmToken).substring(0,16)).set(fcmTokenNode);
                return fcmTokenNode;
            },
            updateFCMToken : async (fcmToken, userId, params) => {
                let fcmTokenNode =  await db.ref(databsePaths.fcmTokensNew + String(fcmToken).substring(0,16)).once("value");
                if(!fcmTokenNode.val()) return false;

                let _fcmTokenNode = fcmTokenNode.val();
                _fcmTokenNode.userId = userId;

                await db.ref(databsePaths.fcmTokensNew + String(fcmToken).substring(0,16)).set(_fcmTokenNode);
                return fcmTokenNode;
            }
        }
    }
}

