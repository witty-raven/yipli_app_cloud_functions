
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
        if (this.timestamp)
            this.timestampDate = new Date(this.timestamp);
        else
            this.timestampDate = null;

        this.type = modelData["type"] || "FITNESS_GAMING";
        this.xp = modelData["xp"];
        this.agp = modelData["agp"] || {};
        this.calories = modelData["calories"];
        this.fitnessPoints = modelData.fitnessPoints;
    }

    getYear() {
        if (this.timestampDate) {
            return this.timestampDate.getFullYear();
        }
        return null;
    }

    // This script is released to the public domain and may be used, modified and
    // distributed without restrictions. Attribution not necessary but appreciated.
    // Source: https://weeknumber.net/how-to/javascript

    // Returns the ISO week of the date.
    getWeek() {
        let tempDate = new Date(this.timestamp);
        tempDate.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(tempDate.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    getDayOfTheWeek() {
        //console.log(`--------- GETTING DAY OF THE WEEK: ${this.timestampDate}`);
        //console.log(`--------- RETURNING DAY OF THE WEEK: ${this.timestampDate.getDay()}`);
        return this.timestampDate.getDay();
    }

    getDayOfTheMonth() {
        return this.timestampDate.getUTCDate();
    }
    // Returns the four-digit year corresponding to the ISO week of the date.
    getWeekYear() {
        if (this.timestampDate) {
            return this.timestampDate.getFullYear();
        }
        return null;
    }

    getMonth() {
        return this.timestampDate.getMonth();
    }

    static fromJSON(json) {
        var modelData = {};
        modelData.type = json["type"] || "FITNESS_GAMING";
        modelData.age = json["age"] || 0;
        modelData.duration = json["duration"] || 0;
        modelData.gameId = json["game-id"] || "";
        modelData.intensityLevel = json["intensity"] || "";
        modelData.matId = json["mat-id"] || "";
        modelData.playerHeight = json["height"] || "";
        modelData.playerId = json["player-id"] || "";
        modelData.points = json["points"] || "";
        modelData.userId = json["user-id"] || "";
        modelData.fitnessPoints = json["fitness-points"] || 0;
        modelData.calories = json["calories"] || 0;

        modelData.gameData;
        if (json["game-data"]) {
            modelData.gameData = {};
            modelData.gameData = json["game-data"];

        }

        modelData.playerActionCounts;
        if (json["player-actions"]) {
            modelData.playerActionCounts = {};
            modelData.playerActionCounts = json["player-actions"];

        }
        modelData.agp;
        if (json["agp"]) {
            modelData.agp = {};
            modelData.agp.nextChapterRef = json["agp"]["next-chap-ref"];
            modelData.agp.nextClassRef = json["agp"]["next-class-ref"];

            //Check if the chapter is history or current
            modelData.agp.isRepeatedChapter = (!modelData.agp.nextChapterRef) ? true : false;
            modelData.agp.completedChapterIndex = json["agp"]["completed-chap-index"];
            modelData.agp.rating = json["agp"]["rating"];
        }

        modelData["xp"] = json["xp"] || 0;
        modelData["timestamp"] = json["timestamp"];
        return new PlayerSessionDataModel(modelData);
    }
}

//PlayerSessionDataModel;