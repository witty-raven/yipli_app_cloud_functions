/* eslint-disable no-extra-boolean-cast */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
//const utils = require('./utils');
const PlayerSessionDataModel = require('./models/playerSessionModel')
const processAdventureGamingSessionData = require('./models/adventureGamingProcessor')
admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.processPlayerSessionData = functions.database.ref('/stage-bucket/player-sessions/{sessionId}')
    .onCreate((snapshot) => {
        console.debug(` ----------------- FUNCTION STARTED : ${snapshot.key} -----------------`);

        //* Fetching JSON data with values from the snapshot
        const playerSessionDataModelJSON = snapshot.val();
        console.debug(playerSessionDataModelJSON);
        console.debug(playerSessionDataModelJSON);

        //* Create Player Session Data Model from JSON
        const playerSessionDataModel = PlayerSessionDataModel.fromJSON(playerSessionDataModelJSON);
        console.debug(` ----------------- DATA PARSED : ${snapshot.key} -----------------`);

        console.debug(playerSessionDataModel);

        //* Getting player's current activity statistics database reference
        let playerActivityRef = `/profiles/users/${playerSessionDataModel.userId}/players/${playerSessionDataModel.playerId}/activity-statistics`;
        let playerDBRef = admin.database().ref(playerActivityRef);
        let playerActivityStatistics;
        //* Getting player's current activity statistics values
        playerDBRef.once('value').then(async (playerActivityStatisticsSnapshot) => {

            let updatePayload = {};

            //* Updating the player's last played timestamp
            const lastPlayedTimestamp = (playerSessionDataModel.timestamp);
            console.debug(`lastPlayedTimestamp: ${lastPlayedTimestamp}`);
            if (lastPlayedTimestamp === null)
                throw new Error("LAST TIME STAMP NOT SET! Please set the last played timestamp!");


            playerActivityStatistics = playerActivityStatisticsSnapshot.val();
            console.debug(playerActivityStatistics);

            //* If activity statistics are not found, create for the player
            if (playerActivityStatistics === null) {
                console.debug("Player statistics null hence creating!");
                playerActivityStatistics = buildNewActivityStatistics(playerActivityStatistics, playerSessionDataModel);
            }
            console.debug(`Calories: ${playerSessionDataModel.calories} and Fitness Points:${playerSessionDataModel.fitnessPoints}`);

            //* Update activity statistics 
            setActivityStatsDataFromModel(playerActivityStatistics, lastPlayedTimestamp, playerSessionDataModel);

            var adventureGamingDataToUpdate = null;
            //* Update game activity data & adventure gaming data
            if (playerSessionDataModel.type === "FITNESS_GAMING")
                setGameActivityDataFromModel(playerActivityStatistics, playerSessionDataModel, lastPlayedTimestamp);
            else if (playerSessionDataModel.type === "ADVENTURE_GAMING")
                adventureGamingDataToUpdate = await processAdventureGamingSessionData(playerSessionDataModel);



            //* Create player session data to insert in the game-sessions
            const playerSessionDataModelToUpdate = snapshot.toJSON();
            console.debug(playerSessionDataModelToUpdate);
            //* Update player session data to insert in the game-sessions
            playerSessionDataModelToUpdate["calories"] = playerSessionDataModel.calories;
            playerSessionDataModelToUpdate["fitness-points"] = playerSessionDataModel.fitnessPoints;
            // /user-statistics/<<USER_ID>>/performance-statistics/Weekly/2020/45/playerData/<<PLAYER_ID>>

            //* Get weekly stats data to be updated;   Get monthly stats data to be updated; Get daily stats data to be updated
            var [weeklyStatsDataToUpdate, monthStatsDataToUpdate, dailyStatsDataToUpdate] = await Promise.all([
                processWeeklyStatisticsData(playerSessionDataModel),
                processMonthlyStatisticsData(playerSessionDataModel),
                processDailyStatisticsData(playerSessionDataModel)]);

            //* Get database reference for the game-sessions
            let newSessionRef = admin.database().ref('/sessions/game-sessions').push();
            let newSessionPath = `/sessions/game-sessions/${newSessionRef.key}`;

            if (adventureGamingDataToUpdate) {
                updatePayload[getAdventureGamingStatsRef(playerSessionDataModel)] = adventureGamingDataToUpdate.toJSON();
            }
            updatePayload[newSessionPath] = playerSessionDataModelToUpdate;
            updatePayload[playerActivityRef] = playerActivityStatistics;

            updatePayload[getWeeklyStatsRef(playerSessionDataModel)] = weeklyStatsDataToUpdate;
            updatePayload[getWeeklyStatsForPlayerRef(playerSessionDataModel)] = weeklyStatsDataToUpdate;

            updatePayload[getMonthlyStatsRef(playerSessionDataModel)] = monthStatsDataToUpdate;
            updatePayload[getMonthlyStatsForPlayerRef(playerSessionDataModel)] = monthStatsDataToUpdate;

            updatePayload[getDailyStatsForPlayerRef(playerSessionDataModel)] = dailyStatsDataToUpdate;
            updatePayload[getDailyStatsRef(playerSessionDataModel)] = dailyStatsDataToUpdate;


            console.debug(` ----------------- UPLOADING CHANGES : ${snapshot.key} -----------------`);

            console.debug(updatePayload);
            //* Update database reference for all data
            await admin.database().ref().update(updatePayload);

            console.log(` ----------------- FUNCTION END : ${snapshot.key} -----------------`);

            //* Remove data from staging
            return snapshot.ref.remove();


        }).catch(exception => {
            console.error(exception);
        });
        // Grab the current value of what was written to the Realtime Database
        console.log(playerActivityStatistics);

    });



async function processWeeklyStatisticsData(playerSessionDataModel) {
    var weeklyStatsRef = admin.database().ref(getWeeklyStatsRef(playerSessionDataModel));
    var currentWeeklyStatsDataSnapshot = await weeklyStatsRef.once('value');
    var weeklyStatsDataToUpdate;

    if (currentWeeklyStatsDataSnapshot) {
        let currentWeeklyStatsData = currentWeeklyStatsDataSnapshot.val();
        console.debug(`Current weekly stats data: ${currentWeeklyStatsDataSnapshot.val()}`);
        if (currentWeeklyStatsData) {
            //* fp: Fitness Points; c: calories; dp: daily punch
            weeklyStatsDataToUpdate = {
                "fp": currentWeeklyStatsData["fp"] + playerSessionDataModel.fitnessPoints,
                "c": currentWeeklyStatsData["c"] + playerSessionDataModel.calories,
                "d": currentWeeklyStatsData["d"] + playerSessionDataModel.duration,
                "dp": currentWeeklyStatsData["dp"]
            };

        }
        else {
            weeklyStatsDataToUpdate = {
                "fp": playerSessionDataModel.fitnessPoints,
                "c": playerSessionDataModel.calories,
                "d": playerSessionDataModel.duration,
                "dp": {}
            };
        }
        weeklyStatsDataToUpdate.dp[playerSessionDataModel.getDayOfTheWeek()] = true;
        //* tpd: total days punched
        weeklyStatsDataToUpdate["tdp"] = Object.keys(weeklyStatsDataToUpdate.dp).length;
    }
    return weeklyStatsDataToUpdate;
}

async function processDailyStatisticsData(playerSessionDataModel) {
    var dailyStatsRef = admin.database().ref(getDailyStatsRef(playerSessionDataModel));
    var currentDailyStatsDataSnapshot = await dailyStatsRef.once('value');
    var dailyStatsDataToUpdate;

    if (currentDailyStatsDataSnapshot) {
        let currentDailyStatsData = currentDailyStatsDataSnapshot.val();
        console.debug(`Current weekly stats data: ${currentDailyStatsDataSnapshot.val()}`);
        if (currentDailyStatsData) {
            //* fp: Fitness Points; c: calories; t: how many times today?; d: duration
            dailyStatsDataToUpdate = {
                "fp": currentDailyStatsData["fp"] + playerSessionDataModel.fitnessPoints,
                "c": currentDailyStatsData["c"] + playerSessionDataModel.calories,
                "d": currentDailyStatsData["d"] + playerSessionDataModel.duration,
                "t": currentDailyStatsData["t"] + 1
            };

        }
        else {
            dailyStatsDataToUpdate = {
                "fp": playerSessionDataModel.fitnessPoints,
                "c": playerSessionDataModel.calories,
                "d": playerSessionDataModel.duration,
                "t": 1
            };
        }
    }
    return dailyStatsDataToUpdate;
}

function getWeeklyStatsRef(playerSessionDataModel) {
    return `/user-stats/${playerSessionDataModel.userId}/w/${playerSessionDataModel.getWeekYear()}/${playerSessionDataModel.getWeek()}/${playerSessionDataModel.playerId}`;
}

function getAdventureGamingStatsRef(playerSessionDataModel) {
    return `/agp/${playerSessionDataModel.userId}/${playerSessionDataModel.playerId}/world0/p0`;
}

function getWeeklyStatsForPlayerRef(playerSessionDataModel) {
    return `/user-stats/${playerSessionDataModel.userId}/${playerSessionDataModel.playerId}/w/${playerSessionDataModel.getWeekYear()}/${playerSessionDataModel.getWeek()}/`;
}

async function processMonthlyStatisticsData(playerSessionDataModel) {
    var monthlyStatsRef = admin.database().ref(getMonthlyStatsRef(playerSessionDataModel));
    var currentMonthlyStatsDataSnapshot = await monthlyStatsRef.once('value');
    var monthlyStatsDataToUpdate;

    if (currentMonthlyStatsDataSnapshot) {
        let currentMonthlyStatsData = currentMonthlyStatsDataSnapshot.val();
        console.debug(`Current weekly stats data: ${currentMonthlyStatsDataSnapshot.val()}`);

        //* fp: Fitness Points; c: calories; tdp: how many times today?; d: duration
        if (currentMonthlyStatsData) {
            monthlyStatsDataToUpdate = {
                "fp": currentMonthlyStatsData["fp"] + playerSessionDataModel.fitnessPoints,
                "c": currentMonthlyStatsData["c"] + playerSessionDataModel.calories,
                "d": currentMonthlyStatsData["d"] + playerSessionDataModel.duration,
                "dp": currentMonthlyStatsData["dp"]
            };
        }
        else {
            monthlyStatsDataToUpdate = {
                "fp": playerSessionDataModel.fitnessPoints,
                "c": playerSessionDataModel.calories,
                "d": playerSessionDataModel.duration,
                "dp": {}
            };
        }
        monthlyStatsDataToUpdate.dp[playerSessionDataModel.getDayOfTheMonth()] = true;

        //* tpd: total days punched
        monthlyStatsDataToUpdate["tdp"] = Object.keys(monthlyStatsDataToUpdate.dp).length;
    }
    console.debug("Sending Monthly updates");
    console.debug(monthlyStatsDataToUpdate);
    console.debug("Sent Monthly updates");
    return monthlyStatsDataToUpdate;
}


function getMonthlyStatsRef(playerSessionDataModel) {
    return `/user-stats/${playerSessionDataModel.userId}/m/${playerSessionDataModel.getYear()}/${playerSessionDataModel.getMonth()}/${playerSessionDataModel.playerId}`;
}

function getMonthlyStatsForPlayerRef(playerSessionDataModel) {
    return `/user-stats/${playerSessionDataModel.userId}/${playerSessionDataModel.playerId}/m/${playerSessionDataModel.getYear()}/${playerSessionDataModel.getMonth()}/`;
}

function getDailyStatsRef(playerSessionDataModel) {
    return `/user-stats/${playerSessionDataModel.userId}/d/${playerSessionDataModel.getYear()}/${playerSessionDataModel.getMonth()}/${playerSessionDataModel.getDayOfTheMonth()}/${playerSessionDataModel.playerId}`;
}

function getDailyStatsForPlayerRef(playerSessionDataModel) {
    return `/user-stats/${playerSessionDataModel.userId}/${playerSessionDataModel.playerId}/d/${playerSessionDataModel.getYear()}/${playerSessionDataModel.getMonth()}/${playerSessionDataModel.getDayOfTheMonth()}`;
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
    playerActivityStatistics["total-xp"] = (playerActivityStatistics["total-xp"] || 0) + playerSessionDataModel.xp;

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
