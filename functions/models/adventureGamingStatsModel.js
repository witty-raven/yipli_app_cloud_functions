
module.exports = class PlayerAdventureGamingStatsModel {
    constructor(modelData) {
        this.nextChapterRef = modelData["nextChapterRef"];
        this.nextClassRef = modelData["nextClassRef"];
        this.currentIndex = modelData["currentIndex"];
        this.totalFp = modelData["totalFp"];
        this.averageRating = modelData["averageRating"];
        this.progressStats = [];
        if (modelData["progressStats"]) {
            modelData["progressStats"].forEach(progressStatModelData => {
                this.progressStats.push(progressStatModelData);
            });
        }

    }

    toJSON() {
        var jsonToReturn = {};
        jsonToReturn["next-chapter-ref"] = this.nextChapterRef;
        jsonToReturn["next-class-ref"] = this.nextClassRef;
        jsonToReturn["current-index"] = this.currentIndex;
        jsonToReturn["total-fp"] = this.totalFp;
        jsonToReturn["average-rating"] = this.averageRating;
        jsonToReturn["progress-stats"] = [];
        this.progressStats.forEach(progressStat => {
            var jsonForProgressStat = {};
            jsonForProgressStat["chapter-ref"] = progressStat.chapterRef;
            jsonForProgressStat["class-ref"] = progressStat.classRef;
            jsonForProgressStat["rating"] = progressStat.rating;
            jsonForProgressStat["chap-fp"] = progressStat.chapFp;
            jsonForProgressStat["chap-c"] = progressStat.chapC;
            jsonForProgressStat["chap-t"] = progressStat.chapT;
            jsonForProgressStat["count"] = progressStat.count;
            jsonToReturn["progress-stats"].push(jsonForProgressStat);
        });
        return jsonToReturn;
    }


    static fromJSON(json) {
        var modelData = {};
        modelData.nextChapterRef = json["next-chapter-ref"];
        modelData.nextClassRef = json["next-class-ref"];
        modelData.currentIndex = json["current-index"];
        modelData.totalFp = json["total-fp"] || 0;
        modelData.averageRating = json["average-rating"] || 0;

        modelData.progressStats;
        if (json["progress-stats"]) {
            modelData.progressStats = [];
            json["progress-stats"].forEach(progressStatJson => {
                var progressStatToPush = {
                    chapterRef: progressStatJson["chapter-ref"],
                    classRef: progressStatJson["class-ref"],
                    rating: progressStatJson["rating"],
                    chapFp: progressStatJson["chap-fp"],
                    chapC: progressStatJson["chap-c"],
                    chapT: progressStatJson["chap-t"],
                    count: progressStatJson["count"],
                }
                modelData.progressStats.push(progressStatToPush);
            });
        }

        return new PlayerAdventureGamingStatsModel(modelData);
    }
}

//PlayerSessionDataModel;