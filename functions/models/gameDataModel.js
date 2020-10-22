
module.exports = class GameDataModel {
    constructor(modelData) {
        this.gameData = modelData["gameData"];
    }

    toJSON() {
        return this.gameData;
    }

    static fromJSON(json) {
        var modelData = {};
        modelData.gameData = null;
        if (json["game-data"]) {
            modelData.gameData = {};
            modelData.gameData = json["game-data"];

        }

        return new GameDataModel(modelData);
    }
}

//PlayerSessionDataModel;