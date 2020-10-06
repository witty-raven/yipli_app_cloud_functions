const PlayerSessionDataModel = require("./playerSessionModel");
const admin = require('firebase-admin');
const PlayerAdventureGamingStatsModel = require("./adventureGamingStatsModel");

module.exports = async function (playerSessionDataModel) {

    // Check the model passed is of the correct type
    if (!(playerSessionDataModel instanceof PlayerSessionDataModel)) throw new Error(`Player Session Model is not passed as model. Please check: ${playerSessionDataModel}`);

    //* get current stats for the player for the current world
    let playerDBRef = admin.database().ref(getAdventureGamingStatsRef(playerSessionDataModel));
    //* Getting player's current activity statistics values
    let playerAdventureGamingStatisticsSnapshot = await playerDBRef.once('value');
    var playerAdventureGamingStatistics = PlayerAdventureGamingStatsModel.fromJSON(playerAdventureGamingStatisticsSnapshot.val());

    //* Check if history class and update coun
    if (playerSessionDataModel.agp.isRepeatedChapter) {
        const completedChapterIndex = playerSessionDataModel.agp.completedChapterIndex;
        playerAdventureGamingStatistics.progressStats[completedChapterIndex].count++;
        playerAdventureGamingStatistics.progressStats[completedChapterIndex].rating = Math.max(playerSessionDataModel.agp.rating,playerAdventureGamingStatistics.progressStats[completedChapterIndex].rating);
        playerAdventureGamingStatistics.progressStats[completedChapterIndex].chapFp += playerSessionDataModel.fitnessPoints;
        playerAdventureGamingStatistics.progressStats[completedChapterIndex].chapC += playerSessionDataModel.calories;
        playerAdventureGamingStatistics.progressStats[completedChapterIndex].chapT += playerSessionDataModel.duration;

    } else {
        //* Add stats for current completed chapter session with above data
        playerAdventureGamingStatistics.progressStats.push({
            chapterRef: playerSessionDataModel.agp.nextChapterRef,
            classRef: playerSessionDataModel.agp.nextClassRef,
            rating: playerSessionDataModel.agp.rating,
            chapFp: playerSessionDataModel.fitnessPoints,
            chapC: playerSessionDataModel.calories,
            chapT: playerSessionDataModel.duration,
            count: 1
        });

        //* Set index for the next chapter and related refs
        playerAdventureGamingStatistics.currentIndex += 1;
        playerAdventureGamingStatistics.nextChapterRef = playerSessionDataModel.agp.nextChapterRef;
        playerAdventureGamingStatistics.nextClassRef = playerSessionDataModel.agp.nextClassRef;

    }

    //* Calculate total FP for the player for that world
    playerAdventureGamingStatistics.totalFp += playerSessionDataModel.fitnessPoints;

    //* Calculate average rating for the player for the world
    let sumOfRatings = 0; 
    playerAdventureGamingStatistics.progressStats.forEach(progressStat => {
        sumOfRatings += progressStat.rating;
    });
    

    console.log(sumOfRatings);
    playerAdventureGamingStatistics.averageRating = sumOfRatings/playerAdventureGamingStatistics.progressStats.length;

    //* return the data to be stored for the adventure gaming session
    return playerAdventureGamingStatistics;

};


function getAdventureGamingStatsRef(playerSessionDataModel) {
    return `/agp/${playerSessionDataModel.userId}/${playerSessionDataModel.playerId}/world0/p0`;
}



