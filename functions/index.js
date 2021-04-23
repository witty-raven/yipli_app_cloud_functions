/* eslint-disable no-extra-boolean-cast */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
//const utils = require('./utils');
const PlayerSessionDataModel = require('./models/playerSessionModel')
const processAdventureGamingSessionData = require('./models/adventureGamingProcessor');
const GameDataModel = require('./models/gameDataModel');
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

            //* If activity statistics are not found, initialize empty for the player
            if (playerActivityStatistics === null) {
                console.debug("Player statistics null hence creating!");
                playerActivityStatistics = initializeNewActivityStats(playerActivityStatistics, playerSessionDataModel);
            }
            console.debug(`Calories: ${playerSessionDataModel.calories} and Fitness Points:${playerSessionDataModel.fitnessPoints}`);

            //* Update activity statistics. This code does not handle game-statistics. 
            setActivityStatsDataFromModel(playerActivityStatistics, lastPlayedTimestamp, playerSessionDataModel);
            
            //* Update game activity data & adventure gaming data
            if (playerSessionDataModel.type === "FITNESS_GAMING")
                setGameActivityStatsFromModel(playerActivityStatistics, playerSessionDataModel, lastPlayedTimestamp);
            
            //TODO: uncomment this code after adventure gaming feature completed.
            /*
            var adventureGamingDataToUpdate = null;
             else if (playerSessionDataModel.type === "ADVENTURE_GAMING")
                 adventureGamingDataToUpdate = await processAdventureGamingSessionData(playerSessionDataModel);
            */

            //Followinf block of code is for fgd [game data]
            const gameDataToUpdate = GameDataModel.fromJSON(playerSessionDataModelJSON);
            if (gameDataToUpdate.gameData !== null) {
                updatePayload[getGameDataRef(playerSessionDataModel)] = gameDataToUpdate.gameData;
            }

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
            
            //TODO: uncomment this code after adventure gaming feature completed.
            /*
            if (adventureGamingDataToUpdate) {
                updatePayload[getAdventureGamingStatsRef(playerSessionDataModel)] = adventureGamingDataToUpdate.toJSON();
            }
            */
           
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

exports.processPlayerInboxPlayedTimeData = functions.database.ref('/user-stats/{userId}/d/{yearId}/{monthId}/{dayId}/{playerId}/t')
    .onWrite((change, context)=>{           
        var beforePlayedTime = change.before.val();
        var afterPlayedTime = change.after.val();
           
        //assigning playedId from database path
        var playerId = context.params.playerId;
        var userId = context.params.userId;

        if(beforePlayedTime < 900) // 15 mins time check to process the special rewards.
        {           
                 //check for gold card and platinum card
                 afterPlayedTime >= 1800 ? platinumCardInboxEntryInDB(playerId,userId)
                 : afterPlayedTime >= 900  ? goldCardInboxEntryInDB(playerId,userId)
                 :  console.log("=========== No any Cards are unlocked");   
            
        } else   if(beforePlayedTime < 1800) // 30 mins time check to process the special rewards.
        {
                     //check for gold card and platinum card
                     afterPlayedTime >= 1800 ? platinumCardInboxEntryInDB(playerId,userId)
                    //  : afterPlayedTime >= 900  ? goldCardInboxEntryInDB(playerId,getTime,goldCardIndoxDBRef,goldCardTimeInboxDBRef,goldCardTitleInboxDBRef,goldCardDescriptionInboxDBRef)
                     :  console.log("=========== No any Cards are unlocked");
                
        }     

        return console.log("=== Function execution completed ===");
    });

    function goldCardInboxEntryInDB(playerId,userId){
        let timestamp = new Date();
        var dd = String(timestamp.getDate()).padStart(2, '0');
        var mm = String(timestamp.getMonth() + 1).padStart(2, '0');
        var yyyy = timestamp.getFullYear();
        let today = dd + '/' + mm + '/' + yyyy;
        let getDate = timestamp.getDate();
        let getTime = today;

        let indexIdForPlayerTimeReward = getDate;
        
        var pathForGoldRewards = `/inbox/${userId}/${playerId}/special-rewards/${indexIdForPlayerTimeReward}/`;
      
        let goldCardIndoxDBRef = admin.database().ref(pathForGoldRewards+`fp/`);
        let goldCardTimeInboxDBRef = admin.database().ref(pathForGoldRewards+`timestamp/`);
        let goldCardTitleInboxDBRef = admin.database().ref(pathForGoldRewards+`title/`);
        let goldCardDescriptionInboxDBRef = admin.database().ref(pathForGoldRewards+`desc/`);

        console.log(playerId+" =========== Gold-Card is unlocked");
        goldCardIndoxDBRef.set(10000);
        goldCardTimeInboxDBRef.set(getTime);
        goldCardTitleInboxDBRef.set('Gold');
        goldCardDescriptionInboxDBRef.set('Rewarded for playing more than 15 mimutes.');
    }

    function platinumCardInboxEntryInDB(playerId,userId){

        let timestamp = new Date();
        var dd = String(timestamp.getDate()).padStart(2, '0');
        var mm = String(timestamp.getMonth() + 1).padStart(2, '0');
        var yyyy = timestamp.getFullYear();
        let today = dd + '/' + mm + '/' + yyyy;
        let getDate = timestamp.getDate();
        let getTime = today;

        let indexIdForPlayerCaloriesReward = getDate + 1;

        var pathForPlatinumRewards = `/inbox/${userId}/${playerId}/special-rewards/${indexIdForPlayerCaloriesReward}/`;

        let platinumCardInboxDBRef = admin.database().ref(pathForPlatinumRewards+`fp/`);
        let platinumCardTimeInboxDBRef = admin.database().ref(pathForPlatinumRewards+`timestamp/`);
        let platinumCardTitleInboxDBRef = admin.database().ref(pathForPlatinumRewards+`title/`);
        let platinumCardDescritionInboxDBRef = admin.database().ref(pathForPlatinumRewards+`desc/`);
        
        console.log(playerId + " =========== Platinum-Card is unlocked");
        platinumCardInboxDBRef.set(25000);
        platinumCardTimeInboxDBRef.set(getTime);
        platinumCardTitleInboxDBRef.set('Platinum');
        platinumCardDescritionInboxDBRef.set('Rewarded for playing more than 30 mimutes.');
    }      

exports.processPlayerInboxCaloriesRewardData = functions.database.ref('/user-stats/{userId}/d/{yearId}/{monthId}/{dayId}/{playerId}/c')
    .onWrite((change, context)=>{
        var caloriesBurnedBefore = change.before.val();
        var caloriesBurnedAfter = change.after.val();

        //assigning playedId from database path
        var playerId = context.params.playerId;
        var userId = context.params.userId;

        // if player burned more than 25 calories then allow to process special rewards.
        if(caloriesBurnedBefore < 25){ 
            
                  caloriesBurnedAfter >= 75 ? intenseWorkoutRewardCardsCardInboxEntryInDB(playerId, userId)
                  : caloriesBurnedAfter >= 25  ? lightWorkOutRewardCardInboxEntryInDB(playerId,userId)
                  :  console.log("=========== No any Cards are unlocked");      
               
            
        }else if(caloriesBurnedBefore<75){
            //check for intense workout and light workout
            caloriesBurnedAfter >= 75 ? intenseWorkoutRewardCardsCardInboxEntryInDB(playerId,userId)
            //   : caloriesBurnedAfter >= 25  ? lightWorkOutRewardCardInboxEntryInDB(playerId,getTime,lightWorkOutCardIndoxDBRef,lightWorkOutCardTimeInboxDBRef,lightWorkOutCardTitleInboxDBRef,lightWorkOutCardDescriptionInboxDBRef)
                :  console.log("=========== No any Cards are unlocked");    

        }

        return console.log("=== Function execution completed ===");
});

function lightWorkOutRewardCardInboxEntryInDB(playerId,userId){
    
    let timestamp = new Date();
    var dd = String(timestamp.getDate()).padStart(2, '0');
    var mm = String(timestamp.getMonth() + 1).padStart(2, '0');
    var yyyy = timestamp.getFullYear();
    let today = dd + '/' + mm + '/' + yyyy;
    let getDate = timestamp.getDate();
    let getTime = today;

    
    let indexIdForPlayerTimeReward = getDate + 2;
    
    var pathForLightWorkOut = `/inbox/${userId}/${playerId}/special-rewards/${indexIdForPlayerTimeReward}/`;
    
    let lightWorkOutCardIndoxDBRef = admin.database().ref(pathForLightWorkOut+`fp/`);
    let lightWorkOutCardTimeInboxDBRef = admin.database().ref(pathForLightWorkOut+`timestamp/`);
    let lightWorkOutCardTitleInboxDBRef = admin.database().ref(pathForLightWorkOut+`title/`);
    let lightWorkOutCardDescriptionInboxDBRef = admin.database().ref(pathForLightWorkOut+`desc/`);
    
    console.log(playerId+" =========== Light Workout is unlocked");
    lightWorkOutCardIndoxDBRef.set(10000);
    lightWorkOutCardTimeInboxDBRef.set(getTime);
    lightWorkOutCardTitleInboxDBRef.set('Silver');
    lightWorkOutCardDescriptionInboxDBRef.set('Rewarded for burnung 25 calories.');
}

function intenseWorkoutRewardCardsCardInboxEntryInDB(playerId, userId,){
    
    let timestamp = new Date();
    var dd = String(timestamp.getDate()).padStart(2, '0');
    var mm = String(timestamp.getMonth() + 1).padStart(2, '0');
    var yyyy = timestamp.getFullYear();
    let today = dd + '/' + mm + '/' + yyyy;
    let getDate = timestamp.getDate();
    let getTime = today;

    let indexIdForPlayerCaloriesReward = getDate + 3;
    
    //assigning path in inbox
    var pathForIntenceWorkOut =  `/inbox/${userId}/${playerId}/special-rewards/${indexIdForPlayerCaloriesReward}/`;

    let intenceWorkOutCardInboxDBRef = admin.database().ref(pathForIntenceWorkOut+`fp/`);
    let intenceWorkOutCardTimeInboxDBRef = admin.database().ref(pathForIntenceWorkOut+`timestamp/`);
    let intenceWorkOutCardTitleInboxDBRef = admin.database().ref(pathForIntenceWorkOut+`title/`);
    let intenceWorkOutCardDescriptionInboxDBRef = admin.database().ref(pathForIntenceWorkOut+`desc/`);
    
    console.log(playerId + " =========== Intense Workout is unlocked");            
    intenceWorkOutCardInboxDBRef.set(25000);
    intenceWorkOutCardTimeInboxDBRef.set(getTime);
    intenceWorkOutCardTitleInboxDBRef.set('Diamond');
    intenceWorkOutCardDescriptionInboxDBRef.set('Rewarded for burnung 75 calories.');
}

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

function getGameDataRef(playerSessionDataModel){
    return `/fgd/${playerSessionDataModel.userId}/${playerSessionDataModel.playerId}/${playerSessionDataModel.gameId}`;
}
function getWeeklyStatsRef(playerSessionDataModel) {
    return `/user-stats/${playerSessionDataModel.userId}/w/${playerSessionDataModel.getWeekYear()}/${playerSessionDataModel.getWeek()}/${playerSessionDataModel.playerId}`;
}

function getAdventureGamingStatsRef(playerSessionDataModel) {
    return `/agp/${playerSessionDataModel.userId}/${playerSessionDataModel.playerId}/worlds/0/p0`;
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

function setGameActivityStatsFromModel(playerActivityStatistics, playerSessionDataModel, lastPlayedTimestamp) {

    if (playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]) {
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["last-played"] = lastPlayedTimestamp;
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["calories-burnt"] += playerSessionDataModel.calories;
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["duration"] += (playerSessionDataModel.duration);
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["fitness-points"] += playerSessionDataModel.fitnessPoints;
       
        //Game points won't exist for multiplayer mayhem, hence the following check.
        // if(playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["game-points"]){
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["game-points"] += playerSessionDataModel.points ? (playerSessionDataModel.points) : 0;
           // }
    }
    else {
        playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId] = {
            "last-played": lastPlayedTimestamp,
            "calories-burnt": playerSessionDataModel.calories,
            "duration": playerSessionDataModel.duration,
            "fitness-points": playerSessionDataModel.fitnessPoints,
            "game-points": playerSessionDataModel.points ? (playerSessionDataModel.points) : 0,
        };

    }

    //Specialhandling incase of Multiplayer (same mat) games, to track the mini games
    if(playerSessionDataModel.gameId === "multiplayermayhem") {
        if(playerSessionDataModel.miniGameId && playerSessionDataModel.miniGameId.length > 1)
        {
            // if (playerActivityStatistics === null) {
            //     console.debug("Player statistics null hence creating!");
            //     playerActivityStatistics = initializeNewActivityStats(playerActivityStatistics, playerSessionDataModel);
            // }

            if(playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["minigames-stats"]){
                console.debug("Mini Games statistics not null hence not created!");
                console.debug("mini game" + playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["minigames-stats"]);
            } else {              
                console.debug("Mini Games statistics null hence creating!");
                playerActivityStatistics = initializeNewMiniGamesStats(playerActivityStatistics, playerSessionDataModel);   
            }
            
            if(playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["minigames-stats"][playerSessionDataModel.miniGameId])
            {
                playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["minigames-stats"][playerSessionDataModel.miniGameId]["last-played"] = lastPlayedTimestamp;
                playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["minigames-stats"][playerSessionDataModel.miniGameId]["calories-burnt"] += playerSessionDataModel.calories;
                playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["minigames-stats"][playerSessionDataModel.miniGameId]["duration"] += (playerSessionDataModel.duration);
                playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["minigames-stats"][playerSessionDataModel.miniGameId]["fitness-points"] += playerSessionDataModel.fitnessPoints;
                playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["minigames-stats"][playerSessionDataModel.miniGameId]["game-points"] += playerSessionDataModel.points ? (playerSessionDataModel.points) : 0;
            }
            else
            {
                playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["minigames-stats"][playerSessionDataModel.miniGameId] = {
                "last-played": lastPlayedTimestamp,
                "calories-burnt": playerSessionDataModel.calories,
                "duration": playerSessionDataModel.duration,
                "fitness-points": playerSessionDataModel.fitnessPoints,
                "game-points": playerSessionDataModel.points ? (playerSessionDataModel.points) : 0,
                };
            }
        }
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
    
    
    //TODO: uncomment this code when we start giving "fitness-cards"
    /* 
    if(!playerActivityStatistics["fitness-cards"]){
        playerActivityStatistics["fitness-cards"] = {};
    }
    playerSessionDataModel.fitnessCards.forEach(fitnessCardIndex => {
        playerActivityStatistics["fitness-cards"][fitnessCardIndex] = (playerActivityStatistics["fitness-cards"][fitnessCardIndex] || 0) + 1;
    });
    */

}

function initializeNewActivityStats(playerActivityStatistics, playerSessionDataModel) {
    playerActivityStatistics = {
        "last-played": 0,
        "total-calories-burnt": 0,
        "total-duration": 0,
        "total-fitness-points": 0,
        "redeemed-fitness-points": 0,
        // "fitness-cards": [],
        "games-statistics": {}
    };
    
    playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId] = null;

    return playerActivityStatistics;
}

function initializeNewMiniGamesStats(playerActivityStatistics, playerSessionDataModel){

    //First read multiplayer-mayhem data and then append minigame-stats as empty object.
    playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId] = {
        "last-played": playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["last-played"],
        "calories-burnt": playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["calories-burnt"],
        "duration": playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["duration"],
        "fitness-points": playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["fitness-points"],
        "game-points" : playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["game-points"],
        "minigames-stats": {}
    }

    playerActivityStatistics["games-statistics"][playerSessionDataModel.gameId]["minigames-stats"][playerSessionDataModel.miniGameId] = null;

    return playerActivityStatistics;

}
