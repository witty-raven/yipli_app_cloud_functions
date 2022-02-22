const { query } = require("express");
const firebase = require("firebase-admin");

REQUEST = "Usage";

const UTILITY = require("../utility/utility");

const newUsertimePeriod = {
    'month' : getNewUsersInMonth,
    'year' : getNewUsersInYear,
    'week' : getNewUsersInWeek,
    'day' : getNewUsersOnDate,
    'custom' : getNewUsersfromTo
}
const activeUsertimePeriod = {
    'month' : getActiveUsersInMonth,
    'year' : getActiveUsersInYear,
    'week' : getActiveUsersInWeek,
    'day' : getActiveUsersOnDate,
    'custom' : getActiveUsersfromTo
}
const platformUsagetimePeriod = {
    'month' : getPlatformUsageInMonth,
    'year' : getPlatformUsageInYear,
    'week' : getPlatformUsageInWeek,
    'day' : getPlatformUsageOnDate,
    'custom' : getPlatformUsagefromTo
}
const playtimeTimePeriod = {
    'month' : getPlaytimeInMonth,
    'year' : getPlaytimeInYear,
    'week' : getPlaytimeInWeek,
    'day' : getPlaytimeOnDate,
    'custom' : getPlaytimefromTo
}
const sessionsTimePeriod = {
    'month' : getSessionsInMonth,
    'year' : getSessionsInYear,
    'week' : getSessionsInWeek,
    'day' : getSessionsOnDate,
    'custom' : getSessionsfromTo
}
const usageList = {
    'weekDayWisePlaytime' : getDayWisePlaytime,
    'hourWisePlaytime' : getHourWisePlaytime,
    
}
const weekDayWisePlaytimeUsageTimeperiod = {
    'month' : getDayWisePlaytimeInMonth,
    'year' : getDayWisePlaytimeInYear,
    'week' : getDayWisePlaytimeInWeek,
    'day' : getDayWisePlaytimeOnDate,
    'custom' : getDayWisePlaytimeFromTo
}
const hourWisePlaytimeUsageTimeperiod = {
    'month' : getHourWisePlaytimeInMonth,
    'year' : getHourWisePlaytimeInYear,
    'week' : getHourWisePlaytimeInWeek,
    'day' : getHourWisePlaytimeOnDate,
    'custom' : getHourWisePlaytimeFromTo
}

//////////////////////////////////USER USAGE SECTION//////////////////////////////////
const getNewUsers = async (query) => {
    if(newUsertimePeriod.hasOwnProperty(query.timePeriod)){
        return new Promise((resolve, reject)=>{
            newUsertimePeriod[query.timePeriod](query).then(response => {
                response = {query : REQUEST + " -> New Users -> " + query.timePeriod, response : response};
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
}

const getActiveUsers = async (query) => {
    if(activeUsertimePeriod.hasOwnProperty(query.timePeriod)){
        return new Promise((resolve, reject)=>{
            activeUsertimePeriod[query.timePeriod](query).then(response => {
                response = {query : REQUEST + " -> Active Users -> " + query.timePeriod, response : response};
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
}

const getPlatformUsage = async (query) => {
    if(platformUsagetimePeriod.hasOwnProperty(query.timePeriod)){
        return new Promise((resolve, reject)=>{
            platformUsagetimePeriod[query.timePeriod](query).then(response => {
                response = {query : REQUEST + " -> New Users -> " + query.timePeriod, response : response};
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
}

const getPlaytime = async (query) => {
    if(playtimeTimePeriod.hasOwnProperty(query.timePeriod)){
        return new Promise((resolve, reject)=>{
            playtimeTimePeriod[query.timePeriod](query).then(response => {
                response = {query : REQUEST + " -> Playtime -> " + query.timePeriod, response : response};
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
}

const getSessions = async (query) => {
    if(sessionsTimePeriod.hasOwnProperty(query.timePeriod)){
        return new Promise((resolve, reject)=>{
            sessionsTimePeriod[query.timePeriod](query).then(response => {
                response = {query : REQUEST + " -> Sessions -> " + query.timePeriod, response : response};
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
}

const getUsage = async (query) => {
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

////////////////////////////////////Local Functions////////////////////////////////////
async function getNewUsersInMonth(query) {
    var year = query.year;
    var month = query.month;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](month)) return Promise.reject("bad request");

    query.from = new Date(year, month, 1);
    query.from = query.from.getTime();
    query.to = new Date(year, month + 1 ,0);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getNewUsersfromTo(query).then(userList => resolve(userList));
    })
}
async function getNewUsersInYear(query) {
    var year = query.year;
    if(!UTILITY.checks["null-check"](year)) return Promise.reject("bad request");

    query.from = new Date(year, 0, 1);
    query.from = query.from.getTime();
    query.to = new Date(year + 1, 0 ,1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getNewUsersfromTo(query).then(userList => resolve(userList));
    }) 
}
async function getNewUsersInWeek(query) {
    var year = query.year;
    var week = query.week;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](week)) return Promise.reject("bad request");

    query.from = new Date(year, 0, (1 + (week - 1) * 7));
    query.from = query.from.getTime();
    query.to = new Date(year, 0 ,(1 + (week) * 7));
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getNewUsersfromTo(query).then(userList => resolve(userList));
    })
}
async function getNewUsersOnDate(query) {
    const d = new Date(parseInt(query.date));

    query.from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    query.from = query.from.getTime();
    query.to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getNewUsersfromTo(query).then(userList => resolve(userList));
    })
}
async function getNewUsersfromTo(query) {
    const from = parseInt(query.from);
    const to = parseInt(query.to);

    var ref = firebase.database().ref(UTILITY.paths["pathToUser"]).orderByChild("created-on").startAt(from).endAt(to);
    return new Promise((resolve, reject)=> {
        userList = [];
        ref.once("value").then(users =>{
            users.forEach(user=>{
                userList.push({
                    'userId' : user.key,
                    'createdOn' : user.child("created-on").val()
                })
            })
            resolve(userList);
        })
    })

}

async function getActiveUsersInMonth(query) {
    var year = query.year;
    var month = query.month;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](month)) return Promise.reject("bad request");

    query.from = new Date(year, month, 1);
    query.from = query.from.getTime();
    query.to = new Date(year, month + 1 ,0);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getActiveUsersfromTo(query).then(userList => resolve(userList));
    })
}
async function getActiveUsersInYear(query) {
    var year = query.year;
    if(!UTILITY.checks["null-check"](year)) return Promise.reject("bad request");

    query.from = new Date(year, 0, 1);
    query.from = query.from.getTime();
    query.to = new Date(year + 1, 0 ,1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getActiveUsersfromTo(query).then(userList => resolve(userList));
    }) 
}
async function getActiveUsersInWeek(query) {
    var year = query.year;
    var week = query.week;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](week)) return Promise.reject("bad request");

    query.from = new Date(year, 0, (1 + (week - 1) * 7));
    query.from = query.from.getTime();
    query.to = new Date(year, 0 ,(1 + (week) * 7));
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getActiveUsersfromTo(query).then(userList => resolve(userList));
    })
}
async function getActiveUsersOnDate(query) {
    const d = new Date(parseInt(query.date));

    query.from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    query.from = query.from.getTime();
    query.to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getActiveUsersfromTo(query).then(userList => resolve(userList));
    })
}
async function getActiveUsersfromTo(query) {
    var from = parseInt(query.from);
    var to = parseInt(query.to);
    var userList = [];

    var ref = firebase.database().ref(UTILITY.paths["pathToSessions"]).orderByChild("timestamp").startAt(from).endAt(to);
    return new Promise((resolve, reject)=> {
        ref.once("value").then(sessions =>{
            sessions.forEach(session=>{
               if(!(userList.includes(session.child("user-id").val()))) userList.push(session.child("user-id").val());
            })
            resolve(userList);
        })
    })

}

async function getPlatformUsageInMonth(query) {
    var year = query.year;
    var month = query.month;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](month)) return Promise.reject("bad request");

    query.from = new Date(year, month, 1);
    query.from = query.from.getTime();
    query.to = new Date(year, month + 1 ,0);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getPlatformUsagefromTo(query).then(platformUsage => resolve(platformUsage));
    })
}
async function getPlatformUsageInYear(query) {
    var year = query.year;
    if(!UTILITY.checks["null-check"](year)) return Promise.reject("bad request");

    query.from = new Date(year, 0, 1);
    query.from = query.from.getTime();
    query.to = new Date(year + 1, 0 ,1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getPlatformUsagefromTo(query).then(platformUsage => resolve(platformUsage));
    }) 
}
async function getPlatformUsageInWeek(query) {
    var year = query.year;
    var week = query.week;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](week)) return Promise.reject("bad request");

    query.from = new Date(year, 0, (1 + (week - 1) * 7));
    query.from = query.from.getTime();
    query.to = new Date(year, 0 ,(1 + (week) * 7));
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getPlatformUsagefromTo(query).then(platformUsage => resolve(platformUsage));
    })
}
async function getPlatformUsageOnDate(query) {
    const d = new Date(parseInt(query.date));

    query.from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    query.from = query.from.getTime();
    query.to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getPlatformUsagefromTo(query).then(platformUsage => resolve(platformUsage));
    })
}
async function getPlatformUsagefromTo(query) {
    from = parseInt(query.from);
    to = parseInt(query.to);

    var ref = firebase.database().ref(UTILITY.paths["pathToSessions"]).orderByChild("timestamp").startAt(from).endAt(to);
    return new Promise((resolve, reject)=> {
        platformUsage = {
            a : 0,
            i : 0,
            w : 0,
            unknown : 0
        };
        ref.once("value").then(sessions =>{
            sessions.forEach(session=>{
                if(session.child("os").val()) platformUsage[session.child("os").val()] = platformUsage[session.child("os").val()] + parseInt(session.child("duration").val());
                else platformUsage[session.child("os").val()] = platformUsage["unknown"] + parseInt(session.child("duration").val());
            })
            delete platformUsage["null"];
            resolve(platformUsage);
        })
    })

}

async function getPlaytimeInMonth(query) {
    var year = query.year;
    var month = query.month;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](month)) return Promise.reject("bad request");

    query.from = new Date(year, month, 1);
    query.from = query.from.getTime();
    query.to = new Date(year, month + 1 ,0);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getPlaytimefromTo(query).then(playtime => resolve(playtime));
    })
}
async function getPlaytimeInYear(query) {
    var year = query.year;
    if(!UTILITY.checks["null-check"](year)) return Promise.reject("bad request");

    query.from = new Date(year, 0, 1);
    query.from = query.from.getTime();
    query.to = new Date(year + 1, 0 ,1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getPlaytimefromTo(query).then(playtime => resolve(playtime));
    }) 
}
async function getPlaytimeInWeek(query) {
    var year = query.year;
    var week = query.week;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](week)) return Promise.reject("bad request");

    query.from = new Date(year, 0, (1 + (week - 1) * 7));
    query.from = query.from.getTime();
    query.to = new Date(year, 0 ,(1 + (week) * 7));
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getPlaytimefromTo(query).then(playtime => resolve(playtime));
    })
}
async function getPlaytimeOnDate(query) {
    const d = new Date(parseInt(query.date));

    query.from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    query.from = query.from.getTime();
    query.to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getPlaytimefromTo(query).then(playtime => resolve(playtime));
    })
}
async function getPlaytimefromTo(query) {
    from = parseInt(query.from);
    to = parseInt(query.to);
    var playtime = 0;
    
    const dataSet = query.dataSet;

    var ref = firebase.database().ref(UTILITY.paths["pathToSessions"]).orderByChild("timestamp").startAt(from).endAt(to);

    return new Promise((resolve, reject)=>{
        
        ref.once("value").then(sessions=>{
            sessions.forEach(session=>{
                if(session.child("duration").val() > 0) playtime = playtime + parseInt(session.child("duration").val())
            })
            resolve(playtime);
        })
    })
}

async function getSessionsInMonth(query) {
    var year = query.year;
    var month = query.month;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](month)) return Promise.reject("bad request");

    query.from = new Date(year, month, 1);
    query.from = query.from.getTime();
    query.to = new Date(year, month + 1 ,0);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getSessionsfromTo(query).then(sessions => resolve(sessions));
    })
}
async function getSessionsInYear(query) {
    var year = query.year;
    if(!UTILITY.checks["null-check"](year)) return Promise.reject("bad request");

    query.from = new Date(year, 0, 1);
    query.from = query.from.getTime();
    query.to = new Date(year + 1, 0 ,1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getSessionsfromTo(query).then(sessions => resolve(sessions));
    }) 
}
async function getSessionsInWeek(query) {
    var year = query.year;
    var week = query.week;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](week)) return Promise.reject("bad request");

    query.from = new Date(year, 0, (1 + (week - 1) * 7));
    query.from = query.from.getTime();
    query.to = new Date(year, 0 ,(1 + (week) * 7));
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getSessionsfromTo(query).then(sessions => resolve(sessions));
    })
}
async function getSessionsOnDate(query) {
    const d = new Date(parseInt(query.date));

    query.from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    query.from = query.from.getTime();
    query.to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getSessionsfromTo(query).then(sessions => resolve(sessions));
    })
}
async function getSessionsfromTo(query) {
    from = parseInt(query.from);
    to = parseInt(query.to);
    var sessionsArray = [];

    var ref = firebase.database().ref(UTILITY.paths["pathToSessions"]).orderByChild("timestamp").startAt(from).endAt(to);

    return new Promise((resolve, reject)=>{
        ref.once("value").then(sessions=>{
            sessions.forEach(session=>{
                if(session.child("duration").val() > 0) sessionsArray.push(session.val())
            })
            resolve(sessionsArray);
        })
    })
}

async function getDayWisePlaytime(query) {
    if(weekDayWisePlaytimeUsageTimeperiod.hasOwnProperty(query.timePeriod)){
        return new Promise((resolve, reject) =>{
            weekDayWisePlaytimeUsageTimeperiod[query.timePeriod](query).then(response => {
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
} 
async function getDayWisePlaytimeInMonth(query) {
    var year = query.year;
    var month = query.month;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](month)) return Promise.reject("bad request");

    query.from = new Date(year, month, 1);
    query.from = query.from.getTime();
    query.to = new Date(year, month + 1 ,0);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getDayWisePlaytimeFromTo(query).then(playtime => resolve(playtime));
    })
}
async function getDayWisePlaytimeInYear(query) {
    var year = query.year;
    if(!UTILITY.checks["null-check"](year)) return Promise.reject("bad request");

    query.from = new Date(year, 0, 1);
    query.from = query.from.getTime();
    query.to = new Date(year + 1, 0 ,1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getDayWisePlaytimeFromTo(query).then(playtime => resolve(playtime));
    }) 
}
async function getDayWisePlaytimeInWeek(query) {
    var year = query.year;
    var week = query.week;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](week)) return Promise.reject("bad request");

    query.from = new Date(year, 0, (1 + (week - 1) * 7));
    query.from = query.from.getTime();
    query.to = new Date(year, 0 ,(1 + (week) * 7));
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getDayWisePlaytimeFromTo(query).then(playtime => resolve(playtime));
    })
}
async function getDayWisePlaytimeOnDate(query) {
    const d = new Date(parseInt(query.date));

    query.from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    query.from = query.from.getTime();
    query.to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getDayWisePlaytimeFromTo(query).then(playtime => resolve(playtime));
    })
}
async function getDayWisePlaytimeFromTo(query) {
    var from = query.from;
    var to = query.to;
    var dayWisePlayTimeArray = [0, 0, 0, 0, 0, 0, 0];

    var ref = firebase.database().ref(UTILITY.paths["pathToSessions"]).orderByChild("timestamp").startAt(from).endAt(to);

    return new Promise(async (resolve, reject) => {
        ref.once("value").then(sessions =>{
            sessions.forEach(session=>{
                var d = new Date(parseInt(session.child("timestamp").val()));
                if(session.child("duration").val() > 0) dayWisePlayTimeArray[d.getDay()] = dayWisePlayTimeArray[d.getDay()] + parseInt(session.child("duration").val());
            })
            var dayWisePlayTimeJson = { };
            for(var i = 0; i < UTILITY.days.length; i++)  dayWisePlayTimeJson[UTILITY.days[i]] = dayWisePlayTimeArray[i];
            resolve(dayWisePlayTimeJson)
        });
    });
}

async function getHourWisePlaytime(query) {

    if(hourWisePlaytimeUsageTimeperiod.hasOwnProperty(query.timePeriod)){
        return new Promise((resolve, reject) =>{
            hourWisePlaytimeUsageTimeperiod[query.timePeriod](query).then(response => {
                resolve(response);
            })
        })
    }
    else Promise.reject("bad Request");
} 
async function getHourWisePlaytimeInMonth(query) {
    var year = query.year;
    var month = query.month;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](month)) return Promise.reject("bad request");

    query.from = new Date(year, month, 1);
    query.from = query.from.getTime();
    query.to = new Date(year, month + 1 ,0);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getHourWisePlaytimeFromTo(query).then(playtime => resolve(playtime));
    })
}
async function getHourWisePlaytimeInYear(query) {
    var year = query.year;
    if(!UTILITY.checks["null-check"](year)) return Promise.reject("bad request");

    query.from = new Date(year, 0, 1);
    query.from = query.from.getTime();
    query.to = new Date(year + 1, 0 ,1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getHourWisePlaytimeFromTo(query).then(playtime => resolve(playtime));
    }) 
}
async function getHourWisePlaytimeInWeek(query) {
    var year = query.year;
    var week = query.week;
    if(!UTILITY.checks["null-check"](year) || !UTILITY.checks["null-check"](week)) return Promise.reject("bad request");

    query.from = new Date(year, 0, (1 + (week - 1) * 7));
    query.from = query.from.getTime();
    query.to = new Date(year, 0 ,(1 + (week) * 7));
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getHourWisePlaytimeFromTo(query).then(playtime => resolve(playtime));
    })
}
async function getHourWisePlaytimeOnDate(query) {
    const d = new Date(parseInt(query.date));

    query.from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    query.from = query.from.getTime();
    query.to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    query.to = query.to.getTime();

    return new Promise((resolve, reject) => {
        getHourWisePlaytimeFromTo(query).then(playtime => resolve(playtime));
    })
}
async function getHourWisePlaytimeFromTo(query) {
    var from = query.from;
    var to = query.to;
    var hourWisePlaytime = [];
    for(var i = 0; i < 24; i++) hourWisePlaytime[i] = 0;

    var ref = firebase.database().ref(UTILITY.paths["pathToSessions"]).orderByChild("timestamp").startAt(from).endAt(to);

    return new Promise(async (resolve, reject) => {
        ref.once("value").then(sessions =>{
            sessions.forEach(session=>{
                var d = new Date(parseInt(session.child("timestamp").val()));
                if(session.child("duration").val() > 0) hourWisePlaytime[d.getHours()] = hourWisePlaytime[d.getHours()] + parseInt(session.child("duration").val());
            })
            var hourWisePlaytimeJson = { };
            for(var i = 0; i < 24; i++) hourWisePlaytimeJson[i + " : 00"] = hourWisePlaytime[i];
            resolve(hourWisePlaytimeJson)
        });
    });
}



exports.request = {
    'newUsers' : getNewUsers,
    'activeUsers' : getActiveUsers,
    'platformUsage' : getPlatformUsage, 
    'playtime' : getPlaytime,
    'sessions' : getSessions,
    'usage' : getUsage
}