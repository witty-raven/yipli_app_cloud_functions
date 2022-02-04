
const admin = require('firebase-admin');
//const utils = require('./utils');


exports.processOSLevelData = async (playerSessionDataModel) => {

    let updateOsPayload = {};

    var [weeklyStatsOsDataToUpdate, monthStatsOsDataToUpdate, dailyStatsOsDataToUpdate] = await Promise.all([
        processWeeklyOsStatsForPlayerRefData(playerSessionDataModel),
        processMonthlyOsStatsForPlayerRefData(playerSessionDataModel),
        processDailyOsStatsForPlayerRefData(playerSessionDataModel)])
    updateOsPayload[getWeeklyOsStatsForPlayerRef(playerSessionDataModel)] = weeklyStatsOsDataToUpdate;
    updateOsPayload[getMonthlyOsStatsForPlayerRef(playerSessionDataModel)] = monthStatsOsDataToUpdate;
    updateOsPayload[getDailyOsStatsForPlayerRef(playerSessionDataModel)] = dailyStatsOsDataToUpdate;
    await admin.database().ref().update(updateOsPayload);

}

function getDailyOsStatsForPlayerRef(playerSessionDataModel) {
    return `/os-stats/${playerSessionDataModel.os}/${playerSessionDataModel.userId}/${playerSessionDataModel.playerId}/d/${playerSessionDataModel.getYear()}/${playerSessionDataModel.getMonth()}/${playerSessionDataModel.getDayOfTheMonth()}`;

}
function getMonthlyOsStatsForPlayerRef(playerSessionDataModel) {

    return `/os-stats/${playerSessionDataModel.os}/${playerSessionDataModel.userId}/${playerSessionDataModel.playerId}/m/${playerSessionDataModel.getYear()}/${playerSessionDataModel.getMonth()}/`;

}

function getWeeklyOsStatsForPlayerRef(playerSessionDataModel) {
    return `/os-stats/${playerSessionDataModel.os}/${playerSessionDataModel.userId}/${playerSessionDataModel.playerId}/w/${playerSessionDataModel.getWeekYear()}/${playerSessionDataModel.getWeek()}/`;
}

async function processWeeklyOsStatsForPlayerRefData(playerSessionDataModel) {
    var weeklyOsStatsRef = admin.database().ref(getWeeklyOsStatsForPlayerRef(playerSessionDataModel));
    let valueAtOSLevelDataObject = await weeklyOsStatsRef.once('value');
    valueAtOSLevelDataObject = valueAtOSLevelDataObject.val();
    if (!valueAtOSLevelDataObject) {
        valueAtOSLevelDataObject = {
            "timestamp": playerSessionDataModel.timestamp,
            "duration": playerSessionDataModel.duration,
            "sessions-counter": 1
        }
    } else {
        valueAtOSLevelDataObject['duration'] = valueAtOSLevelDataObject['duration'] + playerSessionDataModel.duration;
        valueAtOSLevelDataObject['timestamp'] = playerSessionDataModel.timestamp;
        valueAtOSLevelDataObject['sessions-counter'] = valueAtOSLevelDataObject['sessions-counter'] + 1;

    }
    return valueAtOSLevelDataObject;
    // admin.database().ref(getWeeklyOsStatsForPlayerRef).update(valueAtOSLevelDataObject); 

}

async function processMonthlyOsStatsForPlayerRefData(playerSessionDataModel) {
    var weeklyOsStatsRef = admin.database().ref(getMonthlyOsStatsForPlayerRef(playerSessionDataModel));
    let valueAtOSLevelDataObject = await weeklyOsStatsRef.once('value');
    valueAtOSLevelDataObject = valueAtOSLevelDataObject.val();
    if (!valueAtOSLevelDataObject) {
        valueAtOSLevelDataObject = {
            "timestamp": playerSessionDataModel.timestamp,
            "duration": playerSessionDataModel.duration,
            "sessions-counter": 1
        }
    } else {
        valueAtOSLevelDataObject['duration'] = valueAtOSLevelDataObject['duration'] + playerSessionDataModel.duration;
        valueAtOSLevelDataObject['timestamp'] = playerSessionDataModel.timestamp;
        valueAtOSLevelDataObject['sessions-counter'] = valueAtOSLevelDataObject['sessions-counter'] + 1;
    }
    return valueAtOSLevelDataObject;

    // admin.database().ref(getMonthlyOsStatsForPlayerRef).update(valueAtOSLevelDataObject); 

}

async function processDailyOsStatsForPlayerRefData(playerSessionDataModel) {
    var weeklyOsStatsRef = admin.database().ref(getDailyOsStatsForPlayerRef(playerSessionDataModel));
    let valueAtOSLevelDataObject = await weeklyOsStatsRef.once('value');
    valueAtOSLevelDataObject = valueAtOSLevelDataObject.val();
    if (!valueAtOSLevelDataObject) {
        valueAtOSLevelDataObject = {
            "timestamp": playerSessionDataModel.timestamp,
            "duration": playerSessionDataModel.duration,
            "sessions-counter": 1
        }
    } else {
        valueAtOSLevelDataObject['duration'] = valueAtOSLevelDataObject['duration'] + playerSessionDataModel.duration;
        valueAtOSLevelDataObject['timestamp'] = playerSessionDataModel.timestamp;
        valueAtOSLevelDataObject['sessions-counter'] = valueAtOSLevelDataObject['sessions-counter'] + 1;
    }
    return valueAtOSLevelDataObject;
    // admin.database().ref(getDailyOsStatsForPlayerRef).update(valueAtOSLevelDataObject); 
}

