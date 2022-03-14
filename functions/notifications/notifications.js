const admin = require('firebase-admin');
const UTILITY = require('./utility/utility');


const customizationCriteriaDetails = {
    "family-name": "",
    "all-player-name": "",
}

const targetType = {
    "debug-users": getDebugUserTokens,
    "all-users": getAllUserTokensArray,
    "active-users": getActiveUserTokens,
    "inactive-users": getInactiveUserTokens,
    "users-in-leaderboard": getLeaderboardUserTokens,
    "users-not-in-leaderboard": getNonLeaderboardUserTokens
}


const sendNotificatiobns = async (mode) => {
    //Reading notification data from backend here and calling respective function.
    //need to read trigger time and payload data first and then respective function to be triggered.
    var d = new Date();
    var dueNotifications = await getDueNotifications();
    console.log(dueNotifications.val());
    return new Promise((res, rej) => {
        res("Processing");
        if (!dueNotifications.val()) return;
        dueNotifications.forEach(notification => {

            getNotifiactionTemplate(notification.val().template).then(template => {
                console.log(template.val())
                if (false && template.isCustamized) sendCustomNotification(template, notification.val());
                else sendGenericNotification(template.val(), notification);
            })
        })
    });
}

async function getDueNotifications() {
    var d = new Date(new Date().getTime() + 19800000);
    var d_plus_hr = new Date(d.getTime() + (3600000));
    console.log(d.toISOString())
    var dueNotifications = await admin.database().ref(UTILITY.paths["pathToNotificationsInventory"])
        .orderByChild("trigger")
        .startAfter(d.toISOString())
        .endAt(d_plus_hr.toISOString())
        .once("value");
    return dueNotifications;
}

async function getNotifiactionTemplate(template) {
    var notificationTemplate = await admin.database().ref(UTILITY.paths["pathToNotificationTemplates"] + template).once("value");
    return notificationTemplate;
}

async function sendCustomNotification(template, notification) {
    const custamizationCriteria = template["customization-criteria"];
    const target = template["target"];

    if (!targetType.hasOwnProperty(target)) return;

    var users = await targetType[target]();
    var tokenList = {
        android: [],
        ios: []
    };

    var custamDataArray = await getCustmizedData(users, custamizationCriteria);

    users.forEach(user => {
        user.forEach(platform => {
            user.val()[platform.key].forEach(token => {
                //code to be re thought
                if (!tokenList[platform.key].includes(token.val())) {
                    tokenList[platform.key].push(token.val())
                };
            })
        })
    })


    sendNotification(tokenList, notification, custamizationCriteria);
}

async function sendGenericNotification(template, notification) {

    if (!targetType.hasOwnProperty(template.target)) return;

    var users = await targetType[template.target]();

    // console.log(users)

    var tokenList = {
        android: [],
        ios: []
    };

    for (var user in users) {
        for (var platform in users[user]) {
            for (var token in users[user][platform]) {
                if (!tokenList[platform].includes(users[user][platform][token])) {
                    tokenList[platform].push(users[user][platform][token]);
                }
            }
        }
    }

    // console.log(tokenList);
    for (var platform in tokenList) sendNotification(tokenList[platform], notification);
    return;
}

async function getCustmizedData(users, custamizationCriteria) {
    return new Promise((res, rej) => {
        if (customizationCriteriaDetails.hasOwnProperty(custamizationCriteria)) res(null);
        var custamDataArray = [];
        users.forEach(user => {
            customizationCriteriaDetails[custamizationCriteria](userId).then(custamData => {
                custamDataArray.push(custamData);
                if (custamDataArray.length == users.length) res(custamDataArray);
            })
        })
    });
}

function sendNotification(tokens, notification) {
    var notificationJSON = notification.val();
    var payload = {
        notification: {
            title: notificationJSON.title,
            body: notificationJSON.body,
            icon: "default",
            sound: "default",
            click_action: notificationJSON['on-click'],
            priority: "high"
        },
        data: {
            message: notificationJSON.body,
        }
    };
    try {
        console.log(payload);
        admin.messaging().sendToDevice(tokens, payload).then((response) => {
            removeInvalidTokens(response.results, tokens);
            admin.database().ref(UTILITY.paths["pathToNotificationsHistory"] + notification.key).set(notification.val());
            notification.ref.remove();
        });
    }
    catch (error) {
        console.error("Error for token :" + tokens + "is : " + error);
    };

}

async function removeInvalidTokens(results, tokens) {
    var invalidTokens = new Array();
    results.forEach((result, index) => {
        //remove token unde fcm token  using order by child
        console.log("this is first scan" + result.toString());
        const error = result.error;
        errorHandling(error, invalidTokens, tokens, index);
    });

}

function errorHandling(error, invalidTokens, tokens, index) {
    if (error) {
        console.error('Failure sending notification to', tokens[index], error);
        // Cleanup the tokens who are not registered anymore.
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            console.error("Tokens to be removed ");
            console.log(" Result is:" + tokens[index]);
            invalidTokens.push(tokens[index]);

            // TODO: remove the token from your registry/database
        }
    }
    console.log("*********ARRAY OF INVALID TOKENS ******" + invalidTokens);
    console.log("NUMBER OF INVALID TOKENS :" + invalidTokens.length);
    console.log("----------TRYING TO DELETE ----------");
    return invalidTokens;
}


async function getDebugUserTokens() {
    var allUserTokens = await getAllUserTokens();
    var debugUserIds = await getDebugUserIds();
    var debugUserTokens = [];
    allUserTokens.forEach(user => {
        if (!debugUserIds.includes(user.key)) return;
        debugUserTokens.push(user.val());
    })
    return debugUserTokens;
}

async function getAllUserTokens() {
    var users = await admin.database().ref("/fcm-tokens/").once("value");
    return users;
}

async function getAllUserTokensArray() {
    var users = await getAllUserTokens();
    var userTokens = []
    users.forEach(user => {
        userTokens.push(user.val())
    });
    return userTokens;
}

async function getActiveUserTokens() {
    var activeUserIds = await getActiveUserIds();
    var allUserTokens = await getAllUserTokens();
    var activeUserTokens = [];
    allUserTokens.forEach(user => {
        if (!activeUserIds.includes(user.key)) return;
        activeUserTokens.push(user.val())
    })

    return activeUserTokens;
}

async function getInactiveUserTokens() {
    var inactiveUserIds = await getInactiveUserIds();
    var allUserTokens = await getAllUserTokens();
    var inActiveUserTokens = [];
    allUserTokens.forEach(user => {
        if (!inactiveUserIds.includes(user.key)) return;
        inActiveUserTokens.push(user.val())
    })
    return inActiveUserTokens;
}

async function getLeaderboardUserTokens() {
    var leaderboardUsers = await getLeaderboardUserIds();
    var allUserTokens = await getAllUserTokens();
    var leaderboardUserTokens = [];
    allUserTokens.forEach(user => {
        if (!leaderboardUsers.includes(user.key)) return;
        leaderboardUserTokens.push(user.val())
    })
    return leaderboardUserTokens;
}

async function getNonLeaderboardUserTokens() {
    var leaderboardUsers = await getLeaderboardUserIds();
    var allUserTokens = await getAllUserTokens();
    var nonLeaderboardUserTokens = [];
    allUserTokens.forEach(user => {
        if (leaderboardUsers.includes(user.key)) return;
        nonLeaderboardUserTokens.push(user.val())
    })
    return nonLeaderboardUserTokens;
}



async function getInactiveUserIds() {
    var allUsers = await getAllUserTokens();
    var activeUsers = await getActiveUserIds(7);
    var inActiveUsers = [];
    allUsers.forEach(user => {
        if (!activeUsers.includes(user.key)) inActiveUsers.push(user.key);
    })
    return inActiveUsers;
}

async function getActiveUserIds(days) {
    var d = new Date();
    if (!days) days = 7;
    var from = d.getTime() - (1000 * 60 * 60 * 24 * days);
    var to = d.getTime();
    var activeUsers = [];
    var sessions = await admin.database().ref(UTILITY.paths["pathToSessions"]).orderByChild("timestamp").startAt(from).endAt(to).once("value");
    sessions.forEach(session => {
        if (activeUsers.includes(session.child("user-id").val())) return;
        activeUsers.push(session.child("user-id").val());
    })
    return activeUsers;
}

// async function getAllUserIds(res, uidList, nextPageToken) {
//     var users = await admin.auth().listUsers(1000, nextPageToken);
//     console.log(users.users.length);
//     users.users.forEach(user => {
//         if (user.email || user.phoneNumber) uidList.push(user.uid);
//     });
//     if (users.pageToken) {
//         getAllUserIds(res, uidList, users.pageToken);
//         console.log(users.pageToken);
//     }
//     else {
//         res.send(uidList);
//         return uidList;
//     };
// }

async function getLeaderboardUserIds() {
    var leaderboardUsers = [];
    var activeCampaigns = await getActiveCampaigns(new Date().getTime());
    var leaderboardUsers = await getCampaginUserIds(activeCampaigns, 0, leaderboardUsers);
    return leaderboardUsers
}

async function getCampaginUserIds(activeCampaigns, index, userIdList) {
    var campaign = await admin.database().ref(UTILITY.paths["pathToLeaderBoards"] + "campaign/" + activeCampaigns[index].id).once("value")
    campaign.forEach(user => {
        if (activeCampaigns[index]["contestant-type"] === "family" && !userIdList.includes(user.key)) userIdList.push(user.key);
        if (activeCampaigns[index]["contestant-type"] === "player" && !userIdList.includes(user.key)) userIdList.push(user.child("user-id").val());
    })
    if ((activeCampaigns.length - 1) < index) getCampaginUserIds(activeCampaigns, index + 1, userIdList);
    else return userIdList;
}

async function getDebugUserIds() {
    var userIdString = await admin.database().ref("inventory/debug/user-ids").once("value");
    var userIds = new Array();
    userIds = String(userIdString.val()).split(",");
    return userIds;
}


async function getActiveCampaigns(timestamp) {
    if (timestamp.campaignId == 0) timestamp = new Date().getTime();
    var activeCampaigns = [];
    var campaignsEndAfter = await admin.database().ref(UTILITY.paths["pathToLeaderBoardsInventory"] + "campaign/")
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

exports.sendNotification = sendNotificatiobns;