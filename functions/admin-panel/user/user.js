const firebase = require("firebase-admin");

const REQUEST = "User";

const GAME = require("../game/game");
const UTILITY = require("../utility/utility");


//////////////////////////////Query to Method Mapping//////////////////////////////////
const timePeriod = {
    'month' : getUserPlayTimeInMonth,
    'year' : getUserPlayTimeInYear,
    'week' : getUserPlayTimeInWeek,
    'day' : getUserPlaytimeOnDate,
    'allTime' : getUserPlaytimeAllTime,
    'custom' : getUserPlatimefromTo
}
const sessionQueries = {
    'allTime' : getUserSessionsAll,
    'custom' : getUserSessionsFromTo,
    'avarage' : getUserSessionAvrageTime,
}
const detailsList = {
    'name' : getUserDetailsName,
    'email' : getUserDetailsEmail,
    'contact' : getUserDetailsContact,
    'createdOn' : getUserDetailsUserCreatedOn,
    'lastPlayed' : getUserDetailsUserLastPlayedOn,
    'fullProfile' : getUserDetailsProfile,
    'playerIds' : getUserDetailsPlayerIds
}
const usageList = {
    'weekDayWisePlaytime' : getUserDayWisePlaytime,
    'gameWisePlaytime' : getUserGamewisePlaytime,
    'hourWisePlaytime' : getUserHourWiserPlaytime,
    'retension' : getUserRetension
}

const removeUserList = {
    'profile' : removeUserProfile
}

//////////////////////////////////USER USAGE SECTION//////////////////////////////////
const getList = async (query) => {
    return new Promise((resolve, reject) => {
        getUserList(query).then(response => {
            response = { query: REQUEST + " -> List" , response: response };
            resolve(response);
        })
    })
}

const getPlaytime = async (query) => {
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

const getDetails = async (query) =>{
    if(detailsList.hasOwnProperty(query.detail)){
        return new Promise((resolve, reject) =>{
            detailsList[query.detail](query).then(response => {
                response = {query : REQUEST + " -> Details -> " + query.detail, response : response};
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
}

const getUsage = async (query) =>{
    if(usageList.hasOwnProperty(query.usage)){
        return new Promise((resolve, reject) =>{
            usageList[query.usage](query).then(response => {
                response = {query : REQUEST + " -> Usage -> " + query.usage, response : response};
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
}

const removeUser = async (query) => {
    if(removeUserList.hasOwnProperty(query.location)){
        return new Promise((resolve, reject) =>{
            removeUserList[query.location](query).then(response => {
                response = {query : REQUEST + " -> Usage -> " + query.usage, response : response};
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
}


////////////////////////////////////Local Functions////////////////////////////////////
async function getUserList(query) {
    var userList = [];
    var ref; 
    if(query.limit) ref = firebase.database().ref(UTILITY.paths["pathToUser"]).limitToFirst(parseInt(query.limit));
    else ref = firebase.database().ref(UTILITY.paths["pathToUser"]);

    return new Promise((resolve, reject) =>{
        ref.once("value").then(users => {
            users.forEach(user => {
                userList.push({
                    'userId' : user.key,
                    'name' : user.child("display-name").val(),
                    'email' : user.child("email").val(),
                    'contact' : user.child("contact-no").val()
                })
            })
            resolve(userList);
        })
    })
}

async function getUserPlatimefromTo(query) {
    var userId = query.userId;
    var to = parseInt(query.to, 10);
    var from = parseInt(query.from, 10);

    var ref = firebase.database().ref(UTILITY.paths['pathToUserStats'] + userId + "/d/");

    return new Promise(async (resolve, reject) => {
        ref.once("value").then(stats =>{
            var playtime = 0;
            while(from < to){
                var d = new Date(from);
                stats.child(d.getFullYear() + "/" + d.getMonth() + "/" + (d.getDate() - 1))
                .forEach(player =>{
                    playtime = playtime + parseInt(player.child("d").val(), 10);
                });
                from = from + 86400000;
            }
            resolve(playtime);
        });
    })

}
async function getUserPlayTimeInYear(query) {
    var userId = query.userId;
    var year = query.year;
    if(!UTILITY.checks["null-check"](year)) return Promise.reject("bad request");

    const ref = firebase.database().ref(UTILITY.paths['pathToUserStats'] + userId + "/m/" + year);
    return new Promise((resolve, reject) => {
        ref.once("value").then(snap => {
            var playtime = 0;
            snap.forEach(month => {
                month.forEach((player) => {
                    playtime = playtime + parseInt(player.child("d").val(), 10);
                })
            })
            resolve(playtime);
        })
    })
}
async function getUserPlayTimeInWeek(query) {
    var userId = query.userId;
    var year = query.year;
    var week = query.week;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](week)) return Promise.reject("bad request");

    const ref = firebase.database().ref(UTILITY.paths['pathToUserStats'] + userId + "/w/" + year + "/" + week);
    return new Promise((resolve, reject) => {
        ref.once("value").then(snap => {
            var playtime = 0;
            snap.forEach((player) => {
                playtime = playtime + parseInt(player.child("d").val(), 10);
            })
            resolve(playtime);
        })
    })
}
async function getUserPlayTimeInMonth(query) {
    var userId = query.userId;
    var year = query.year;
    var month = query.month;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](month)) return Promise.reject("bad request");

    const ref = firebase.database().ref(UTILITY.paths['pathToUserStats'] + userId + "/m/" + year + "/" + month);
    return new Promise((resolve, reject) => {
        ref.once("value").then(snap => {
            var playtime = 0;
            snap.forEach((player) => {
                playtime = playtime + parseInt(player.child("d").val(), 10);
            })
            resolve(playtime);
        })
    })
}
async function getUserPlaytimeOnDate(query) {
    var userId = query.userId;
    const d = new Date(parseInt(query.date));
    const ref = firebase.database().ref(UTILITY.paths['pathToUserStats'] + userId + "/d/" + d.getFullYear() + "/" + d.getMonth() + "/" + (d.getDate() - 1));
    return new Promise((resolve, reject) => {
        ref.once("value").then(snap => {
            var playtime = 0;
            snap.forEach((player) => {
                playtime = playtime + parseInt(player.child("d").val(), 10);
            })
            resolve(playtime);
        })
    })
}
async function getUserPlaytimeAllTime(query) {
    query.from = await getUserDetailsUserCreatedOn(query);
    query.to = new Date();
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getUserPlatimefromTo(query).then(playtime => resolve(playtime));
    })
}

async function getUserSessionsAll(query){
    const userId = query.userId;
    console.log(userId)
    var ref = firebase.database().ref(UTILITY.paths['pathToSessions']).orderByChild("user-id").equalTo(userId);

    return new Promise((resolve, reject)=>{
        ref.once("value").then(sessions => resolve(sessions));
    })
}
async function getUserSessionsFromTo(query){
    const userId = query.userId;
    const from = parseInt(query.from);
    const to = parseInt(query.to);
    console.log(userId)
    var ref = firebase.database().ref(UTILITY.paths['pathToSessions']).orderByChild("user-id").equalTo(userId);

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
async function getUserSessionAvrageTime(query){
    const userId = query.userId;
    const from = parseInt(query.from);
    const to = parseInt(query.to);
    console.log(userId)
    var ref = firebase.database().ref(UTILITY.paths['pathToSessions']).orderByChild("user-id").equalTo(userId);

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

async function getUserDetailsName(query) {
    const userId = query.userId;
    var ref = firebase.database().ref(UTILITY.paths['pathToUser'] + userId + "/display-name");
    return new Promise((resolve, reject) => {
        if (UTILITY.checks["null-check"](userId)) {
            ref.once("value").then(response => {
                resolve(response)
            });
        }
        else reject("NULL user Name or User not Found")

    });
}
async function getUserDetailsEmail(query) {
    var userId = query.userId;
    var ref = firebase.database().ref(UTILITY.paths['pathToUser'] + userId + "/email");
    return new Promise((resolve, reject) => {
        if (UTILITY.checks["null-check"](userId)) {
            ref.once("value").then(response => {
                resolve(response)
            });
        }
        else reject("NULL user Email or User not Found")

    });
}
async function getUserDetailsContact(query) {
    var userId = query.userId;
    var ref = firebase.database().ref(UTILITY.paths['pathToUser'] + userId + "/contact-no");
    return new Promise((resolve, reject) => {
        if (UTILITY.checks["null-check"](userId)) {
            ref.once("value").then(response => {
                resolve(response)
            });
        }
        else reject("NULL user Contact or User not Found")

    });
}
async function getUserDetailsProfile(query) {
    var userId = query.userId;
    var ref = firebase.database().ref(UTILITY.paths['pathToUser'] + userId);
    return new Promise((resolve, reject) => {
        if (UTILITY.checks["null-check"](userId)) {
            ref.once("value").then(response => {
                resolve(response)
            });
        }
        else reject("User not Found")

    });
}
async function getUserDetailsPlayerIds(query) {
    const userId = query.userId;
    var ref = firebase.database().ref(UTILITY.paths['pathToUser'] + userId + "/players");
    return new Promise((resolve, reject) => {
        if (UTILITY.checks["null-check"](userId)) {
            ref.once("value").then(response => {
                var playerIdsList = [];
                response.forEach(player => playerIdsList.push(player.key));
                response =  playerIdsList;
                resolve(response)
            });
        }
        else reject("NULL user Players or User not Found")

    });
}
async function getUserDetailsPlayers(query) {
    var ref = firebase.database().ref(UTILITY.paths['pathToUser'] + query.userId + "/players");
    return new Promise((resolve, reject)=>{
        ref.once("value").then(players => resolve(players));
    })
}
async function getUserDetailsUserCreatedOn(query) {
    const userId = query.userId;
    var ref = firebase.database().ref(UTILITY.paths['pathToUser'] + userId + "/created-on");
    return new Promise((resolve, reject) => {
        if (UTILITY.checks["null-check"](userId)) {
            ref.once("value").then(response => {
                resolve(response.val());
            });
        }
        else reject("NULL user Name or User not Found")

    });
}
async function getUserDetailsUserLastPlayedOn(query) {
    const userId = query.userId;
    var ref = firebase.database().ref(UTILITY.paths['pathToUser'] + userId + "/players");
    return new Promise((resolve, reject) => {
        if (UTILITY.checks["null-check"](userId)) {
            ref.once("value").then(response => {
                var lastPlayed = 4085109245000;
                response.forEach(player => {
                    var _lastPlayed = player.child("activity-statistics/last-played").val();
                    if (_lastPlayed < lastPlayed && _lastPlayed > 1528965245000) lastPlayed = _lastPlayed;
                });
                if(lastPlayed === 4085109245000 || lastPlayed < 1528965245000) lastPlayed = "0_not available";
                response = lastPlayed;
                resolve(response)
            });
        }
        else reject("NULL user Players or User not Found")

    });
}

async function getUserDayWisePlaytime(query) {
    var userId = query.userId;
    var createdOn = await getUserDetailsUserCreatedOn(query);
    var from = createdOn;
    var to = new Date();
    to = to.getTime();
    var dayWisePlayTimeArray = [0, 0, 0, 0, 0, 0, 0];

    var ref = firebase.database().ref(UTILITY.paths['pathToUserStats'] + userId + "/d/");

    return new Promise(async (resolve, reject) => {
        ref.once("value").then(stats =>{
            while(from < to){
                var playtime = 0;
                var d = new Date(from);
                stats.child(d.getFullYear() + "/" + d.getMonth() + "/" + (d.getDate() - 1))
                .forEach(player =>{
                    playtime = playtime + parseInt(player.child("d").val(), 10);
                });
                dayWisePlayTimeArray[d.getDay()] = dayWisePlayTimeArray[d.getDay()] + parseInt(playtime);
                from = from + 86400000;
            }
            var dayWisePlayTimeJson = { };
            for(var i = 0; i < UTILITY.days.length; i++)  dayWisePlayTimeJson[UTILITY.days[i]] = dayWisePlayTimeArray[i];
            resolve(dayWisePlayTimeJson);
        });
    });
} 
async function getUserGamewisePlaytime(query) {
    return new Promise((resolve, reject) =>{
        if(query.timePeriod === "allTime"){
            getUserGamewisePlaytimeAlltime(query).then(gameWisePlaytime => resolve(gameWisePlaytime));
        }
        else if(query.timePeriod === "custom"){
            getUserGamewisePlaytimeFromTo(query).then(gameWisePlaytime => resolve(gameWisePlaytime));
        }
        else resolve("bad Request");
    })
}
async function getUserGamewisePlaytimeAlltime(query){
    const userId = query.userId;
    var gameList = await GAME.request["list"](query);
    var gameWisePlaytime = { };
    var ref = firebase.database().ref(UTILITY.paths['pathToUser'] + userId + "/players");
    return new Promise((resolve, reject) =>{
        ref.once("value").then(players=>{
            gameList.response.forEach(game =>{
                var playtime = 0;
                players.forEach(player=>{
                    playtime = playtime +  player.child("/activity-statistics/games-statistics/" + game + "/duration").val();
                });
                gameWisePlaytime[game] = playtime;
            })
            resolve(gameWisePlaytime);
        })
    })

}
async function getUserGamewisePlaytimeFromTo(query){
    var sessions = await getUserSessionsFromTo(query);
    query.type = "games";
    var gameList = await GAME.request["list"](query);
    var gameWisePlaytime = { };
    gameList.response.forEach(game => gameWisePlaytime[game] = 0);
    return new Promise((resolve, reject) =>{
        sessions.forEach(session =>{
            gameWisePlaytime[session["game-id"]] = gameWisePlaytime[session["game-id"]] + parseInt(session["duration"]);
        })
        resolve(gameWisePlaytime);
    })
}
async function getUserHourWiserPlaytime(query) {
    var sessions = await getUserSessionsAll(query);

    return new Promise((resolve, reject) => {
        var hourWisePlaytime = [];
        for(var i = 0; i < 24; i++) hourWisePlaytime[i] = 0;
        sessions.forEach(session =>{
            const d = new Date(parseInt(session.child("timestamp").val()));
            hourWisePlaytime[d.getHours()] = hourWisePlaytime[d.getHours()] + parseInt(session.child("duration").val())
        })
        var hourWisePlaytimeJson = {};
        for(var i = 0; i < 24; i++) hourWisePlaytimeJson[i + " : 00"] = hourWisePlaytime[i];
        resolve(hourWisePlaytimeJson);
    })
}
async function getUserRetension(query) {    
    var sessions = await getUserSessionsAll(query);
    var createdOn = await getUserDetailsUserCreatedOn(query);
    
    var retensionPeriod;
    if(query.retensionPeriod) retensionPeriod= query.retensionPeriod;
    else retensionPeriod = 30;

    if(!createdOn) {
        players = await getUserDetailsPlayers(query);
        var _createdOn = 999999999999999;
        if(players){
            players.forEach(player => {
                if(player.child("created-on").val() < _createdOn) _createdOn = player.child("added-on").val();
            })
            if(_createdOn === 999999999999999) return Promise.resolve("User Creation Date Not Available");
            else createdOn = _createdOn;
        }
        else return Promise.resolve("User Creation Date Not Available");
    }
    console.log(createdOn);
    
    var retension = [];

    var d = new Date();
    totalTime = Math.floor((Math.floor((d.getTime() - createdOn)/86400000))/retensionPeriod);
    for(var i = 0; i <= totalTime; i++) retension[i] = 0;
    
    return new Promise((resolve, reject) =>{
        sessions.forEach(session => {
            var index = Math.floor((Math.floor((parseInt(session.child("timestamp").val()) - createdOn)/86400000))/retensionPeriod);
            retension[index] = retension[index] + parseInt(session.child("duration").val());
        })
        resolve(retension);
    })
}

async function removeUserProfile(query) {
    userId = query.userId;

}

exports.request = {
    'list' : getList,
    'playtime': getPlaytime,
    'details' : getDetails,
    'sessions' : getSessions,
    'usage' : getUsage,
    'delete' : removeUser
}

