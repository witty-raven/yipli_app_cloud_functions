const firebase = require("firebase-admin");

const UTILITY = require("../utility/utility");

const REQUEST = "Game"

const detailsList = {
    'url' : getGameDetailsUrls,
    'version' : getGameDetailsVersions,
    'mode' : getGameDetailsMode,
    'type' : getGameDetailsType,
    'isActive' : getGameDetailsAvailablity
}

const timePeriod = {
    'month' : getGamePlayTimeInMonth,
    'year' : getGamePlayTimeInYear,
    'week' : getGamePlayTimeInWeek,
    'day' : getGamePlaytimeOnDate,
    'custom' : getGamePlatimefromTo,
    'allTime' : getGamePlaytimeAllTime
}
const sessionQueries = {
    'allTime' : getGameSessionsAll,
    'custom' : getGameSessionsFromTo,
    'avarage' : getGameSessionAvrageTime,
}

//////////////////////////////////USER USAGE SECTION//////////////////////////////////
const getGames = async (query) => {
    return new Promise((resolve, reject) => {
        getGameList().then(response => {
            response = { query: REQUEST + " -> List" , response: response };
            resolve(response);
        })
    })
}

const getPlaytime = (query) => {
    if(timePeriod.hasOwnProperty(query.timePeriod)){
        return new Promise((resolve, reject)=>{
            timePeriod[query.timePeriod](query).then(response => {
                response = {query : REQUEST + " -> Playtime -> " + query.timePeriod, response : response};
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
}

const getDetails = (query) => {
    if(detailsList.hasOwnProperty(query.detail)){
        return new Promise((resolve, reject)=>{
            detailsList[query.detail](query).then(response => {
                response = {query : REQUEST + " -> Details -> " + query.detail, response : response};
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
}

const getSessions = async (query) =>{
    if(sessionQueries.hasOwnProperty(query.timePeriod)){
        return new Promise((resolve, reject)=>{
            sessionQueries[query.timePeriod](query).then(response => {
                response = {query : REQUEST + " -> Sessions -> " + query.timePeriod, response : response};
                resolve(response);
            })
        })
        
    }
}


////////////////////////////////////Local Functions////////////////////////////////////
async function getGameList() {
    var ref = firebase.database().ref(UTILITY.paths['pathToGameInventory']);
    var gameList = [];
    return new Promise((resolve, reject) => {
        ref.once("value").then(games => {
            games.forEach(game => {
                gameList.push(game.key);
            })
            resolve(gameList);
        })
    })
}

async function getGamePlatimefromTo(query) {
    var playtime = 0;
    var sessions = await getGameSessionsFromTo(query);
    return new Promise((resolve, reject) => {
        
        sessions.forEach(session=>{
            if(session["duration"]) playtime = playtime + parseInt(session["duration"]);
        })
        resolve(playtime);
    })

}
async function getGamePlayTimeInYear(query) {
    var year = query.year;
    if(!UTILITY.checks["null-check"](year)) return Promise.reject("bad request");

    query.from = new Date(year, 0, 1);
    query.from = query.from.getTime();
    query.to = new Date(year + 1, 0 ,1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getGamePlatimefromTo(query).then(playtime => resolve(playtime));
    })    

}
async function getGamePlayTimeInWeek(query) {
    var year = query.year;
    var week = query.week;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](week)) return Promise.reject("bad request");

    query.from = new Date(year, 0, (1 + (week - 1) * 7));
    query.from = query.from.getTime();
    query.to = new Date(year + 1, 0 ,(1 + (week) * 7));
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getGamePlatimefromTo(query).then(playtime => resolve(playtime));
    })

}
async function getGamePlayTimeInMonth(query) {
    var year = query.year;
    var month = query.month;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](month)) return Promise.reject("bad request");

    query.from = new Date(year, month, 1);
    query.from = query.from.getTime();
    query.to = new Date(year + 1, month + 1 ,0);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getGamePlatimefromTo(query).then(playtime => resolve(playtime));
    })
}
async function getGamePlaytimeOnDate(query) {
    const d = new Date(parseInt(query.date));

    query.from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    query.from = query.from.getTime();
    query.to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getGamePlatimefromTo(query).then(playtime => resolve(playtime));
    })
}
async function getGamePlaytimeAllTime(query) {
    var playtime = 0;
    var sessions = await getGameSessionsAll(query);
    return new Promise((resolve, reject) => {
        sessions.forEach(session=>{
            if(session.child("duration").val()) playtime = playtime + parseInt(session.child("duration").val());
        })
        resolve(playtime);
    })
}

async function getGameDetailsUrls(query){
    var gameId = query.gameId;
    var ref = firebase.database().ref(UTILITY.paths["pathToGameInventory"] + gameId);

    return new Promise((resolve, reject)=>{
        ref.once("value").then(game =>{
            resolve({
                'dynamicLink' : game.child("dynamic-link").val()
            })
        })
    })
}
async function getGameDetailsVersions(query){
    var gameId = query.gameId;
    var ref = firebase.database().ref(UTILITY.paths["pathToGameInventory"] + gameId);

    return new Promise((resolve, reject)=>{
        ref.once("value").then(game =>{
            resolve({
                'andoid' : game.child("current-version").val(),
                'iOS' : game.child("ios-current-version").val(),
                'windows' : game.child("win-version").val(),
            })
        })
    })
}
async function getGameDetailsMode(query){
    var gameId = query.gameId;
    var ref = firebase.database().ref(UTILITY.paths["pathToGameInventory"] + gameId);

    return new Promise((resolve, reject)=>{
        ref.once("value").then(game =>{
            resolve(game.child("mode").val())
        })
    })
}
async function getGameDetailsType(query){
    var gameId = query.gameId;
    var ref = firebase.database().ref(UTILITY.paths["pathToGameInventory"] + gameId);

    return new Promise((resolve, reject)=>{
        ref.once("value").then(game =>{
            resolve(game.child("type").val())
        })
    })
}
async function getGameDetailsAvailablity(query){
    var gameId = query.gameId;
    var ref = firebase.database().ref(UTILITY.paths["pathToGameInventory"] + gameId);

    return new Promise((resolve, reject)=>{
        ref.once("value").then(game =>{
            if(!game.child("is-game-under-maintenance").val()) resolve(game.child("maintenance-message").val());
            else resolve(true);
        })
    })
}

async function getGameSessionsAll(query){
    const gameId = query.gameId;
    var ref = firebase.database().ref(UTILITY.paths['pathToSessions']).orderByChild("game-id").equalTo(gameId);
    return new Promise((resolve, reject)=>{
        ref.once("value").then(sessions => resolve(sessions));
    })
}
async function getGameSessionsFromTo(query){
    const gameId = query.gameId;
    const from = parseInt(query.from);
    const to = parseInt(query.to);

    var ref = firebase.database().ref(UTILITY.paths['pathToSessions']).orderByChild("game-id").equalTo(gameId);
    return new Promise((resolve, reject)=>{
        var filteredSessions = [];
        ref.once("value").then(sessions => {
            sessions.forEach(session=>{
                const timestamp = session.child("timestamp").val();
                if(timestamp < to && timestamp > from) filteredSessions.push(session.val());
            })
            resolve(filteredSessions);
        });
    })
}
async function getGameSessionAvrageTime(query){
    const gameId = query.gameId;

    var ref = firebase.database().ref(UTILITY.paths['pathToSessions']).orderByChild("game-id").equalTo(gameId);
    return new Promise((resolve, reject)=>{
        var sessionsCount = 0;
        var duration = 0;
        ref.once("value").then(sessions => {
            sessions.forEach(session=>{
                 duration = duration + session.child("duration").val();
                 sessionsCount++;
            })

            if(sessionsCount > 0) resolve(duration/sessionsCount);
            else resolve("No Sessions");
        });
    })
}

exports.request = {
    'list': getGames,
    'playtime': getPlaytime,
    'details' : getDetails,
    'sessions' : getSessions
}