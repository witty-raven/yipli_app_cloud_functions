module.exports = class PlayerSessionDataModel {
    fromJSON(json) {
        this.age = json["age"] || "";
        this.duration = json["duration"] || "";
        this.endTime = json["end-time"] || "";
        this.gameId = json["game-id"] || "";
        this.intensityLevel = json["intensity-level"] || "";
        this.matId = json["mat-id"] || "";
        this.playerHeight = json["player-height"] || "";
        this.playerId = json["player-id"] || "";
        this.points = json["points"] || "";
        this.startTime = json["start-time"] || "";
        this.userId = json["user-id"] || "";
        if (!!json["game-data"]) {
            this.gameData = {};
            this.gameData.highScore = json["game-data"]["high-score"] || "";
            this.gameData.moneyEarned = json["game-data"]["money-earned"] || "";
        }
        if (!!json["player-action-counts"]) {
            this.playerActionCounts = {};
            this.playerActionCounts = json["player-action-counts"];
            //TODO: Need to check if the actions need to be listed.
        }
    }
}

//PlayerSessionDataModel;