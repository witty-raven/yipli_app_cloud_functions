var UTILITY = require("./utility/utility");

const admin = require('firebase-admin');

exports.leaderBoardData = async (userId, displayName, profilePicUrl) => {
    var pathToLeaderBoard = `/leader-boards/campaign`;
    let getpathToLeaderBoard = admin.database().ref(pathToLeaderBoard);
    getpathToLeaderBoard.once("value", (campaignId) => {
        campaignId.forEach(user => {
            if (user.hasChild(userId)) {
                if (displayName != "") {
                    var displayNamePath = `/leader-boards/campaign/${user.key}/${userId}`;
                    admin.database().ref(displayNamePath).update({ "display-name": displayName, "family-name": displayName });
                }
                else if (profilePicUrl != "") {
                    var displayNamePath = `/leader-boards/campaign/${user.key}/${userId}`;
                    admin.database().ref(displayNamePath).update({ "display-img-url": "profile-pics" + "/" + profilePicUrl });
                }
            }
        })
    })
} 