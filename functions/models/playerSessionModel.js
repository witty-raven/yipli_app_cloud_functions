/* eslint-disable no-extra-boolean-cast */
module.exports = class PlayerSessionDataModel {
    constructor(modelData) {
        this.age = modelData["age"];
        this.duration = modelData["duration"];
        this.endTime = modelData["endTime"];
        this.gameId = modelData["gameId"];
        this.intensityLevel = modelData["intensityLevel"];
        this.matId = modelData["matId"];
        this.playerHeight = modelData["playerHeight"];
        this.playerId = modelData["playerId"];
        this.points = modelData["points"];
        this.startTime = modelData["startTime"];
        this.userId = modelData["userId"];
        this.gameData = modelData["gameData"] || {};
        this.playerActionCounts = modelData["playerActionCounts"] || {};
        this.timestamp = modelData["timestamp"] ? modelData["timestamp"] : null;
        if(this.timestamp)
            this.timestampDate = new Date(this.timestamp);
        else 
            this.timestampDate = null;

        this.calories = modelData["calories"];
        this.fitnessPoints = modelData.fitnessPoints;
    }

    getYear() {
        if (this.timestampDate) {
            return this.timestampDate.getFullYear();
        }
    }

    // This script is released to the public domain and may be used, modified and
    // distributed without restrictions. Attribution not necessary but appreciated.
    // Source: https://weeknumber.net/how-to/javascript

    // Returns the ISO week of the date.
    getWeek() {
        
        this.timestampDate.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        this.timestampDate.setDate(this.timestampDate.getDate() + 3 - (this.timestampDate.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(this.timestampDate.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((this.timestampDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    getDayOfTheWeek(){
        return this.timestampDate.getDay();
    }
    // Returns the four-digit year corresponding to the ISO week of the date.
    getWeekYear() {
        this.timestampDate.setDate(this.timestampDate.getDate() + 3 - (this.timestampDate.getDay() + 6) % 7);
        return this.timestampDate.getFullYear();
    }

    getMonth(){
        return this.timestampDate.getMonth();
    }

    static fromJSON(json) {
        var modelData = {};

        modelData.age = json["age"] || 0;
        modelData.duration = json["duration"] || 0;
        modelData.endTime = json["end-time"] || "";
        modelData.gameId = json["game-id"] || "";
        modelData.intensityLevel = json["intensity-level"] || "";
        modelData.matId = json["mat-id"] || "";
        modelData.playerHeight = json["player-height"] || "";
        modelData.playerId = json["player-id"] || "";
        modelData.points = json["points"] || "";
        modelData.startTime = json["start-time"] || "";
        modelData.userId = json["user-id"] || "";
        modelData.fitnessPoints = json["fitness-points"] || 0;
        modelData.calories = json["calories"] || 0;

        modelData.gameData;
        if (!!json["game-data"]) {
            modelData.gameData = {};
            modelData.gameData = json["game-data"];
            
        }

        modelData.playerActionCounts;
        if (!!json["player-action-counts"]) {
            modelData.playerActionCounts = {};
            modelData.playerActionCounts = json["player-action-counts"];
           
        }
        modelData["timestamp"] = json["timestamp"];

        return new PlayerSessionDataModel(modelData);
    }
}

//PlayerSessionDataModel;