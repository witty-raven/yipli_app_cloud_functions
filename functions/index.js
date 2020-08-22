const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utils');
admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.processPlayerSessionData = functions.database.ref('/stage-bucket/player-sessions/{sessionId}')
    .onCreate((snapshot, context) => {

        const playerSessionData = snapshot.val();

        let userId = playerSessionData["user-id"];
        let playerId = playerSessionData['player-id'];
        let playerActivityRef = `/profiles/users/${userId}/players/${playerId}/activity-statistics`;
        let playerDBRef = admin.database().ref(playerActivityRef);
        let playerActivityStatistics;
        playerDBRef.once('value').then(async (playerActivityStatisticsSnapshot) => {

            const duration = parseInt(playerSessionData["duration"]);
            const intensityLevel = playerSessionData["intensity-level"];
            const gameId = playerSessionData["game-id"];
            const lastPlayedTimestamp = (playerSessionData["timestamp"]) ? (playerSessionData["timestamp"]) : null;
            console.log(`Duration: ${duration}`);

            let calories = utils.calculateCalories(playerSessionData["player-action-counts"], intensityLevel);
            let fitnessPoints = utils.calculateFitnessPoints(duration, playerSessionData["player-action-counts"], intensityLevel);

            playerActivityStatistics = playerActivityStatisticsSnapshot.val();
            console.log(playerActivityStatistics)

            if (playerActivityStatistics === null) {
                console.log("Player statistics null hence creating!");
                playerActivityStatistics = {
                    "last-played": 0,
                    "total-calories-burnt": 0,
                    "total-duration": 0,
                    "total-fitness-points": 0,
                    "redeemed-fitness-points": 0,
                    "games-statistics": {

                    }

                }
                playerActivityStatistics["games-statistics"][gameId] = null;
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
            console.log(playerActivityStatistics);

            const playerSessionDataToUpdate = snapshot.toJSON();
            console.log(playerSessionDataToUpdate);
            playerSessionDataToUpdate["calories"] = calories;
            playerSessionDataToUpdate["fitness-points"] = fitnessPoints;


            let newSessionRef = admin.database().ref('/sessions/game-sessions').push();
            let newSessionPath = `/sessions/game-sessions/${newSessionRef.key}`;
            let updatePayload = {
            }
            updatePayload[newSessionPath] = playerSessionDataToUpdate;
            updatePayload[playerActivityRef] = playerActivityStatistics;
            console.log(updatePayload);
            await admin.database().ref().update(updatePayload);
            return snapshot.ref.remove();

        }).catch(exception => {
            console.error(exception);
        });
        // Grab the current value of what was written to the Realtime Database



        console.log(playerActivityStatistics);

    });
