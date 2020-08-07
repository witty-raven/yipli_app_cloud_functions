exports.unitActionCalorieMap = {
    "left move": 0.1,
    "right move": 0.1,
    "jumping": 0.1,
    "running": 0.04,
    "jump in": 0.1,
    "jump out": 0.1,
    "stop":0,
}

exports.calculateCalories = (playerActionCounts) => {

    let calories = 0.0;
    for (var actionType in playerActionCounts) {
        if (this.unitActionCalorieMap[actionType] !== null) {
            if (this.unitActionCalorieMap[actionType]!== null) {
                calories += parseInt(playerActionCounts[actionType]) * this.unitActionCalorieMap[actionType];
            }
        }
    }
    return Math.round(calories);
}


exports.unitActionFitnessPointsFactorMap = {
    "left move": 10,
    "right move": 10,
    "jumping": 10,
    "running": 4,
    "jump in": 10,
    "jump out": 10,
    "stop":0,
}

exports.calculateFitnessPoints = (duration, playerActionCounts) => {
    let fitnessPoints = 0;
    for (var actionType in playerActionCounts) {
        //totalActionCount += playerActionCounts[actionType];
        if (this.unitActionFitnessPointsFactorMap[actionType] !== null) {
            if (this.unitActionFitnessPointsFactorMap[actionType]!== null) {
                fitnessPoints += parseInt(playerActionCounts[actionType]) * this.unitActionFitnessPointsFactorMap[actionType];
            }
        }
    }
    return Math.round(fitnessPoints);
}