var UTILITY = require("./utility/utility");

const firebase = require('firebase-admin');

const updateInfoType = {
    "user-display-name": "user-display-name",
    "user-display-img-url": "user-display-img-url",
    "player-display-name": "player-display-name",
    "player-display-img-url": "player-display-img-url"
}
exports.updateInfoType = updateInfoType;

const updateLeaderBoardInfo = {
    "user-display-name": updateUserDisplayName,
    "user-display-img-url": updateUserProfilePicUrl,
    "player-display-name": updatePlayerDisplayName,
    "player-display-img-url": updatePlayerProfilePicUrl
}

exports.leaderBoard = async (change, context, infoType) => {

    if (updateLeaderBoardInfo.hasOwnProperty(infoType)) await updateLeaderBoardInfo[infoType](change, context);

    return "proccesed";
}


async function updateUserDisplayName(change, context) {
    const userId = context.params.userId;
    const displayName = change.after.val();
    console.log("updateUserDisplayName: " + displayName);

    var ref = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign");
    await ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var campaignId = childSnapshot.key;
            console.log("Searching for userId: " + userId + " in campaignId: " + campaignId);
            var entryCampaignRef = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaignId + "/" + userId);
            entryCampaignRef.once("value", function (entry) {
                if (entry.val() != null) {
                    console.log("found entry of user " + userId + " in campaign " + campaignId);
                    entryCampaignRef.update({
                        "family-name": displayName,
                        "display-name": displayName
                    });
                }
                else {
                    var entryPlayerRef = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaignId).orderByChild("user-id").equalTo(userId);
                    entryPlayerRef.once("value", (campaign) => {
                        if (campaign.val() != null) {
                            var playerId = "";
                            campaign.forEach(function (player) {
                                if(player.val()["user-id"] == userId) playerId = player.key;
                            })
                            console.log("found entry of user's Player " + playerId + " in campaign " + campaignId);
                            var playerEntryRef = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaignId + "/" + playerId).update({
                                "family-name": displayName
                            });
                        }
                    })
                }
            });
        });
    });
    return;
}
async function updateUserProfilePicUrl(change, context) {
    const userId = context.params.userId;
    var profilePicUrl;
    if (change.after.val() != null) userProfilePicUrl = "profile-pics/" + change.after.val();
    else userProfilePicUrl = "profile-pics/placeholder_image.png";
    
    console.log("updateUserProfilePicUrl: " + userProfilePicUrl);

    var ref = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign");
    await ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var campaignId = childSnapshot.key;
            var entryCampaignRef = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaignId + "/" + userId);
            entryCampaignRef.once("value", function (entry) {
                if (entry.val() != null) {
                    entryCampaignRef.update({
                        "display-img-url": userProfilePicUrl
                    });
                }
            });
        });
    });
    return;
}
async function updatePlayerDisplayName(change, context) {
    const userId = context.params.userId;
    const playerId = context.params.playerId;
    const displayName = change.after.val();

    console.log("updatePlayerDisplayName: " + displayName);

    var ref = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "/campaign");
    await ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var campaignId = childSnapshot.key;
            var entryCampaignRef = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaignId + "/" + playerId);
            entryCampaignRef.once("value", function (entry) {
                if (entry.val() != null) {
                    entryCampaignRef.update({
                        "display-name": displayName
                    });
                }
            });
        });
    });
    return;
}
async function updatePlayerProfilePicUrl(change, context) {
    const userId = context.params.userId;
    const playerId = context.params.playerId;
    var profilePicUrl;
    if (change.after.val() != null) profilePicUrl = "profile-pics/" + change.after.val();
    else profilePicUrl = "profile-pics/placeholder_image.png";

    console.log("updatePlayerProfilePicUrl: " + profilePicUrl);

    var ref = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign");
    await ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var campaignId = childSnapshot.key;
            var entryCampaignRef = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + campaignId + "/" + playerId);
            entryCampaignRef.once("value", function (entry) {
                if (entry.val() != null) {
                    entryCampaignRef.update({
                        "display-img-url": profilePicUrl
                    });
                }
            });
        });
    });
    return;
}