/* eslint-disable no-extra-boolean-cast */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
//const utils = require('./utils');
const playerSessionDataModelModel = require('./models/playerSessionModel')
admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.processPlayerSessionData = functions.database.ref('/stage-bucket/player-sessions/{sessionId}')
    .onCreate((snapshot, context) => {
        console.log("------------------ FUNCTION STARTED ------------------");
        const playerSessionDataJSON = snapshot.val();
        console.log("------------------ DATA PARSED ------------------");
        console.debug(playerSessionDataJSON);
        console.log(playerSessionDataJSON);
        const playerSessionDataModel = playerSessionModel.from(playerSessionDataJSON);
        console.log("------------------ MODEL CREATED ------------------");

        console.debug(playerSessionDataModel);

        let playerDBRef = admin.database().ref(playerActivityRef);
        let playerActivityStatistics;

        playerDBRef.once('value').then(async (playerActivityStatisticsSnapshot) => {

            let updatePayload = {
            }

            const lastPlayedTimestamp = (playerSessionDataModel.timestamp);
            console.log(`lastPlayedTimestamp: ${lastPlayedTimestamp}`);
            if (lastPlayedTimestamp === null) throw new Error("LAST TIME STAMP NOT SET! Please set the last played timestamp!");
            playerActivityStatistics = playerActivityStatisticsSnapshot.val();
            console.log(playerActivityStatistics)

            if (playerActivityStatistics === null) {
                console.log("Player statistics null hence creating!");
                playerActivityStatistics = buildNewActivityStatistics(playerActivityStatistics, playerSessionDataModel);
            }

            console.log(`Calories: ${calories} and Fitness Points:${fitnessPoints}`);
            playerActivityStatistics["last-played"] = lastPlayedTimestamp;
            playerActivityStatistics["total-calories-burnt"] += calories;
            playerActivityStatistics["total-duration"] += (duration);
            playerActivityStatistics["total-fitness-points"] += fitnessPoints;

            if (playerActivityStatistics["games-statistics"][gameId]) {
                playerActivityStatistics["games-statistics"][gameId]["last-played"] = lastPlayedTimestamp;
                playerActivityStatistics["games-statistics"][gameId]["calories-burnt"] += calories;
                playerActivityStatistics["games-statistics"][gameId]["duration"] += (duration);
                playerActivityStatistics["games-statistics"][gameId]["fitness-points"] += fitnessPoints;
                playerActivityStatistics["games-statistics"][gameId]["game-points"] += parseInt(playerSessionData["points"]);

            } else {
                playerActivityStatistics["games-statistics"][gameId] = {
                    "last-played": lastPlayedTimestamp,
                    "calories-burnt": calories,
                    "duration": duration,
                    "fitness-points": fitnessPoints,
                    "game-points": parseInt(playerSessionData["points"]),

                }
            }
            if (playerSessionData["game-data"])
                playerActivityStatistics["games-statistics"][gameId]["game-data"] = playerSessionData["game-data"];
            //console.log(playerActivityStatistics);

            const playerSessionDataToUpdate = snapshot.toJSON();
            //console.log(playerSessionDataToUpdate);
            playerSessionDataToUpdate["calories"] = calories;
            playerSessionDataToUpdate["fitness-points"] = fitnessPoints;



           
            // /user-statistics/<<USER_ID>>/performance-statistics/Weekly/2020/45/playerData/<<PLAYER_ID>>
            var { weeklyStatsRef, weeklyStatsDataToUpdate } = await processWeeklyStatisticsData(playerSessionDataModel);
            var { monthlyStatsRef, monthStatsDataToUpdate } = await processMonthlyStatisticsData(playerSessionDataModel);

            let newSessionRef = admin.database().ref('/sessions/game-sessions').push();
            let newSessionPath = `/sessions/game-sessions/${newSessionRef.key}`;
            updatePayload[newSessionPath] = playerSessionDataModelToUpdate;
            updatePayload[playerActivityRef] = playerActivityStatistics;
            console.log("------------------ UPLOAD DATA CREATED ------------------");
            console.log(updatePayload);
            await admin.database().ref().update(updatePayload);
            console.log("------------------ Function END ------------------");
            return snapshot.ref.remove();

        }).catch(exception => {
            console.error(exception);
        });
        // Grab the current value of what was written to the Realtime Database



        console.log(playerActivityStatistics);

    });

async function processWeeklyStatisticsData(playerSessionDataModel) {
    var weeklyStatsRef = admin.database().ref(`/user-statistics/${playerSessionDataModel.userId}/performance-statistics/weekly/${playerSessionDataModel.getWeekYear()}/${playerSessionDataModel.getWeek()}/playerData/${playerSessionDataModel.playerId}`);
    var currentWeeklyStatsDataSnapshot = await weeklyStatsRef.once('value');
    var weeklyStatsDataToUpdate;

    if (currentWeeklyStatsDataSnapshot) {
        let currentWeeklyStatsData = currentWeeklyStatsDataSnapshot.val();
        if (currentWeeklyStatsData) {
            weeklyStatsDataToUpdate = {
                "fitnessPoints": playerSessionDataModel.fitnessPoints,
                "calories": playerSessionDataModel.calories,
                "dayPunch": {}
            };
        }
        else {
            weeklyStatsDataToUpdate = {
                "fitnessPoints": currentWeeklyStatsData["fitnessPoints"] + playerSessionDataModel.fitnessPoints,
                "calories": currentWeeklyStatsData["calories"] + playerSessionDataModel.calories,
                "dayPunch": currentWeeklyStatsData["dayPunch"]
            };
        }
        weeklyStatsDataToUpdate.dayPunch[playerSessionDataModel.getDayOfTheWeek()] = 1;
        weeklyStatsDataToUpdate["totalDaysPunched"] = weeklyStatsDataToUpdate.dayPunch.length;
    }
    return { weeklyStatsRef, weeklyStatsDataToUpdate };
}

async function processMonthlyStatisticsData(playerSessionDataModel) {
    var monthlyStatsRef = admin.database().ref(`/user-statistics/${playerSessionDataModel.userId}/performance-statistics/monthly/${playerSessionDataModel.getMonthYear()}/${playerSessionDataModel.getMonth()}/playerData/${playerSessionDataModel.playerId}`);
    var currentMonthlyStatsDataSnapshot = await monthlyStatsRef.once('value');
    var monthlyStatsDataToUpdate;

    if (currentMonthlyStatsDataSnapshot) {
        let currentMonthlyStatsData = currentMonthlyStatsDataSnapshot.val();
        if (currentMonthlyStatsData) {
            monthlyStatsDataToUpdate = {
                "fitnessPoints": playerSessionDataModel.fitnessPoints,
                "calories": playerSessionDataModel.calories,
                "dayPunch": {}
            };
        }
        else {
            monthlyStatsDataToUpdate = {
                "fitnessPoints": currentMonthlyStatsData["fitnessPoints"] + playerSessionDataModel.fitnessPoints,
                "calories": currentMonthlyStatsData["calories"] + playerSessionDataModel.calories,
                "dayPunch": currentMonthlyStatsData["dayPunch"]
            };
        }
        monthlyStatsDataToUpdate.dayPunch[playerSessionDataModel.getMonth()] = 1;
        monthlyStatsDataToUpdate["totalDaysPunched"] = monthlyStatsDataToUpdate.dayPunch.length;
    }
    return { monthlyStatsRef, monthlyStatsDataToUpdate };
}

function setGameActivityDataFromModel(playerActivityStatistics, playerSessionDataModel, lastPlayedTimestamp) {
    if (playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]) {
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["last-played"] = lastPlayedTimestamp;
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["calories-burnt"] += playerSessionDataModel.calories;
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["duration"] += (playerSessionDataModel.duration);
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["fitness-points"] += playerSessionDataModel.fitnessPoints;
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["game-points"] += playerSessionDataModel.gameData.highScore ? (playerSessionDataModel.gameData.highScore) : 0;

    }
    else {
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId] = {
            "last-played": lastPlayedTimestamp,
            "calories-burnt": playerSessionDataModel.calories,
            "duration": playerSessionDataModel.duration,
            "fitness-points": playerSessionDataModel.fitnessPoints,
            "game-points": playerSessionDataModel.gameData.highScore ? (playerSessionDataModel.gameData.highScore) : 0,
        };
    }
    if (playerSessionDataModel.gameData)
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["game-data"] = playerSessionDataModel.gameData;
    console.log(playerActivityStatistics);
}

function setActivityStatsDataFromModel(playerActivityStatistics, lastPlayedTimestamp, playerSessionDataModel) {
    playerActivityStatistics["last-played"] = lastPlayedTimestamp;
    playerActivityStatistics["total-calories-burnt"] += playerSessionDataModel.calories;
    playerActivityStatistics["total-duration"] += (playerSessionDataModel.duration);
    playerActivityStatistics["total-fitness-points"] += playerSessionDataModel.fitnessPoints;
}

function buildNewActivityStatistics(playerActivityStatistics, playerSessionDataModel) {
    playerActivityStatistics = {
        "last-played": 0,
        "total-calories-burnt": 0,
        "total-duration": 0,
        "total-fitness-points": 0,
        "redeemed-fitness-points": 0,
        "games-statistics": {}
    };
    playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId] = null;
    return playerActivityStatistics;
}

