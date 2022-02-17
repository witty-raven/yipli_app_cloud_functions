const firebase = require("firebase-admin");
const UTILITY = require("../utility/utility");
const REQUEST = "Campaign Leader Board"
const getCampaignResult = async (query) => {
    const campaignId = query.campaignId;
    var refToResult = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaignId);
    var refToInventory = firebase.database().ref(UTILITY.paths["pathToLeaderBoardsInventory"] + "campaign/" + campaignId)
    var campaignInfo = await refToInventory.once("value");
    var refToTeamplates = firebase.database().ref(UTILITY.paths["pathToLeaderBoardsInventory"] + "templates/" + campaignInfo.child("template").val());
    var template = await refToTeamplates.once("value");
    var campaign = campaignInfo.val();
    campaign.template = template.val();
    campaign["banner-url"] = UTILITY.constructPublicURL(UTILITY.baseURLs["storageURL"], campaign["banner-url"], UTILITY.mediaType["media"]);
    return new Promise((resolve, reject) => {
        refToResult.once("value").then(itemList => {
            var List = [];
            itemList.forEach(item => {
                var obj ={};
                obj.id = item.key;
                obj["display-img-url"] = UTILITY.constructPublicURL(UTILITY.baseURLs["storageURL"], item.child("display-img-url").val(), UTILITY.mediaType["media"]);
                obj["display-name"] = item.child("display-name").val();
                obj["family-name"] = item.child("family-name").val();
                obj["count"] = 0;
                if(campaign["contestant-type"] === "family"){
                    item.child("players").forEach(player => {
                        obj["count"] += player.val()["count"];
                    });
                }
                else obj.count = item.child("count").val();
                List.push(obj);
            })
            campaign.result = List;
            resolve(campaign);
        })
    })
}
const getCampaignList = async (query) => {
    return new Promise((resolve, reject) => resolve("working " + REQUEST))
}
const postSession = async (query) => {
    var session = query;
    var activeCampaign = await getActiveCampaigns(session.timestamp);
    activeCampaign.forEach(campaign => {
        var gameList = String(campaign["game-id"]).split(",");
        if (!gameList.includes(session["game-id"])) return;
        fetchTemplate(campaign.template).then(template => {
            if (template["compete-metric"].min > session[template["compete-metric"].type]) return;
            addEntryToLeaderBoard(session, campaign, template);
        })
    })
    return new Promise((resolve, reject) => resolve(activeCampaign))
}
const createNew = async (query) => {
};
async function getActiveCampaigns(timestamp) {
    if (timestamp.campaignId == 0) timestamp = new Date().getTime();
    var activeCampaigns = [];
    var campaignsEndAfter = await firebase.database().ref(UTILITY.paths["pathToLeaderBoardsInventory"] + "campaign/")
        .orderByChild("tenure/end")
        .startAt(parseInt(timestamp))
        .once("value");
    campaignsEndAfter.forEach(campaign => {
        if (campaign.val().tenure.start < timestamp) {
            var activeCampaign = campaign.val();
            activeCampaign.id = campaign.key;
            activeCampaigns.push(activeCampaign);
        }
    })
    return activeCampaigns;
}
async function fetchTemplate(templateId) {
    var template = await firebase.database().ref(UTILITY.paths["pathToLeaderBoardsInventory"] + "templates/" + templateId).once("value");
    return template.val();
}
async function addEntryToLeaderBoard(session, campaign, template) {
    var entryId = (campaign["contestant-type"] === "family") ? session["user-id"] : session["player-id"];
    var game = await firebase.database().ref(UTILITY.paths["pathToGameInventory"] + session["game-id"]).once("value");
    if (game.mode === "multiplayer") {
        entryId = session["user-id"] + "/" + session["player-id"];
    }
    var entryExists = await firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaign.id + "/" + entryId).once("value");
    if (entryExists.val()) {
        var entry = entryExists.val();
        updateLeaderBoardEntry(session, campaign, template, entryId, entry);
    }
    else createLeaderBoardEntry(session, campaign, template, entryId);
}
async function createLeaderBoardEntry(session, campaign, template, entryId) {
    var entry = {};
    if (campaign["contestant-type"] === "family") {
        entry["players"] = {};
        entry["players"][session["player-id"]] = {};
        entry["players"][session["player-id"]]["count"] = 0;
        if (template["compete-metric"].type === "player-actions") entry["players"][session["player-id"]]["count"] = session[template["compete-metric"].type][template["compete-metric"].action];
        else entry["players"][session["player-id"]]["count"] = session[template["compete-metric"].type];
        entry["players"][session["player-id"]]["timestamp"] = session.timestamp;
        fetchEntryDetails(session, campaign["contestant-type"]).then(details => {
            entry["family-name"] = details["family-name"];
            entry["display-name"] = details["display-name"];
            entry["display-img-url"] = details["display-img-url"];
            firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaign.id + "/" + entryId).set(entry);
        })
    }
    else {
        if (template["compete-metric"].type === "player-actions") entry[session["player-id"]]["count"] = session[template["compete-metric"].type][template["compete-metric"].action];
        else entry["count"] = session[template["compete-metric"].type];
        entry["timestamp"] = session.timestamp;
        entry["user-id"] = session["user-id"];
        fetchEntryDetails(session, campaign["contestant-type"]).then(details => {
            entry["family-name"] = details["family-name"];
            entry["display-name"] = details["display-name"];
            entry["display-img-url"] = details["display-img-url"];
            firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaign.id + "/" + entryId).set(entry);
        })
    }
}
async function updateLeaderBoardEntry(session, campaign, template, entryId, entry) {
    if(campaign["contestant-type"] === "family"){
        if(!entry["players"][session["player-id"]]) {
            entry["players"][session["player-id"]] = {};
            entry["players"][session["player-id"]]["count"] = 0;
        }
        if (template["compete-metric"]["in-one-life"]) {
            if (entry["players"][session["player-id"]]["count"] < session[template["compete-metric"].type]) {
                if (template["compete-metric"].type === "player-actions") entry["players"][session["player-id"]]["count"] = session[template["compete-metric"].type][template["compete-metric"].action];
                else entry["players"][session["player-id"]]["count"] = session[template["compete-metric"].type];
                entry["players"][session["player-id"]]["timestamp"] = session.timestamp;
                firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaign.id + "/" + entryId).set(entry);
            }
        }
        else {
            if (template["compete-metric"].type === "player-actions") entry["players"][session["player-id"]]["count"] = entry["players"][session["player-id"]]["count"] + session[template["compete-metric"].type][template["compete-metric"].action];
            else entry["players"][session["player-id"]]["count"] = entry["players"][session["player-id"]]["count"] + session[template["compete-metric"].type];
            entry["players"][session["player-id"]]["timestamp"] = session.timestamp;
            firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaign.id + "/" + entryId).set(entry);
        }
    }
    else{
        if (template["compete-metric"]["in-one-life"]) {
            if (entry["count"] < session[template["compete-metric"].type]) {
                if (template["compete-metric"].type === "player-actions") entry["count"] = session[template["compete-metric"].type][template["compete-metric"].action];
                else entry["count"] = session[template["compete-metric"].type];
                entry["timestamp"] = session.timestamp;
                firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaign.id + "/" + entryId).set(entry);
            }
        }
        else {
            if (template["compete-metric"].type === "player-actions") entry["count"] = entry["count"] + session[template["compete-metric"].type][template["compete-metric"].action];
            else entry["count"] = entry["count"] + session[template["compete-metric"].type];
            entry["timestamp"] = session.timestamp;
            firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaign.id + "/" + entryId).set(entry);
        }
    }
}
async function fetchEntryDetails(session, contestantType) {
    var userId = session["user-id"];
    var playerId = session["player-id"];
    var details = {};
    var userName = await firebase.database().ref(UTILITY.paths["pathToUser"] + userId + "/display-name").once("value");
    details["family-name"] = userName.val();
    if (contestantType === "family") {
        var familyProfilePic = await firebase.database().ref(UTILITY.paths["pathToUser"] + userId + "/profile-pic-url").once("value");
        details["display-name"] = userName.val();
        if (familyProfilePic.val()) details["display-img-url"] = "profile-pics/" + familyProfilePic.val();
        else details["display-img-url"] = "profile-pics/placeholder_image.png";
        return details;
    }
    var playerName = await firebase.database().ref(UTILITY.paths["pathToUser"] + userId + "/players/" + playerId + "/name").once("value");
    var playerProfileImg = await firebase.database().ref(UTILITY.paths["pathToUser"] + userId + "/players/" + playerId + "/profile-pic-url").once("value")
    details["display-name"] = playerName.val();
    if (playerProfileImg.val()) details["display-img-url"] = "profile-pics/" + playerProfileImg.val();
    else details["display-img-url"] = "profile-pics/placeholder_image.png";
    return details;
}
exports.request = {
    'list': getCampaignList,
    'result': getCampaignResult,
    'listActive': getActiveCampaigns,
    'postSession': postSession,
    'createNew': createNew
}