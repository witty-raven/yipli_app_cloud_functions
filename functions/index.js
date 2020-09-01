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

exports.processplayerSessionDataModel = functions.database.ref('/stage-bucket/player-sessions/{sessionId}')
    .onCreate((snapshot) => {

        const playerSessionDataModelJSON = snapshot.val();
        const playerSessionDataModel = playerSessionDataModelModel.fromJSON(playerSessionDataModelJSON);


        let playerActivityRef = `/profiles/users/${playerSessionDataModel.userId}/players/${playerSessionDataModel.playerId}/activity-statistics`;

        let playerDBRef = admin.database().ref(playerActivityRef);
        let playerActivityStatistics;

        playerDBRef.once('value').then(async (playerActivityStatisticsSnapshot) => {

            let updatePayload = {
            }

            const lastPlayedTimestamp = (playerSessionDataModel.timestamp);
            console.log(`lastPlayedTimestamp: ${lastPlayedTimestamp}`);
            if (lastPlayedTimestamp === null) throw ("LAST TIME STAMP NOT SET! Please set the last played timestamp!");
            playerActivityStatistics = playerActivityStatisticsSnapshot.val();
            console.log(playerActivityStatistics)

            if (playerActivityStatistics === null) {
                console.log("Player statistics null hence creating!");
                playerActivityStatistics = buildNewActivityStatistics(playerActivityStatistics, playerSessionDataModel);
            }

            console.log(`Calories: ${playerSessionDataModel.calories} and Fitness Points:${playerSessionDataModel.fitnessPoints}`);
            setActivityStatsDataFromModel(playerActivityStatistics, lastPlayedTimestamp, playerSessionDataModel);

            setGameActivityDataFromModel(playerActivityStatistics, playerSessionDataModel, lastPlayedTimestamp);

            const playerSessionDataModelToUpdate = snapshot.toJSON();
            console.log(playerSessionDataModelToUpdate);
            playerSessionDataModelToUpdate["calories"] = playerSessionDataModel.calories;
            playerSessionDataModelToUpdate["fitness-points"] = playerSessionDataModel.fitnessPoints;


           



           
            // /user-statistics/<<USER_ID>>/performance-statistics/Weekly/2020/45/playerData/<<PLAYER_ID>>
            var { weeklyStatsRef, weeklyStatsDataToUpdate } = await processWeeklyStatisticsData(playerSessionDataModel);
            var { monthlyStatsRef, monthStatsDataToUpdate } = await processMonthlyStatisticsData(playerSessionDataModel);

            let newSessionRef = admin.database().ref('/sessions/game-sessions').push();
            let newSessionPath = `/sessions/game-sessions/${newSessionRef.key}`;
            updatePayload[newSessionPath] = playerSessionDataModelToUpdate;
            updatePayload[playerActivityRef] = playerActivityStatistics;
            updatePayload[weeklyStatsRef] = weeklyStatsDataToUpdate;
            updatePayload[monthlyStatsRef] = monthStatsDataToUpdate;

            console.log(updatePayload);
            await admin.database().ref().update(updatePayload);


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
        if (!!currentWeeklyStatsData) {
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
        if (!!currentMonthlyStatsData) {
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

