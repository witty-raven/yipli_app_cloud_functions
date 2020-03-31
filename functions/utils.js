exports.unitActionCalorieMap = {
    "left-move": {
        "low": 1,
        "medium": 3,
        "high": 8
    },
    "right-move": {
        "low": 3,
        "medium": 5,
        "high": 7
    },
    "jump": {
        "low": 7,
        "medium": 9,
        "high": 11
    },
    "walk": {
        "low": 2,
        "medium": 4,
        "high": 6
    },
    "running": {
        "low": 4,
        "medium": 8,
        "high": 12
    },
    "stop": {
        "low": 1,
        "medium": 1,
        "high": 1
    }
}

exports.calculateCalories = (playerActionCounts, intensityLevel) => {

    let calories = 0.0;
    for (var actionType in playerActionCounts) {
        if (this.unitActionCalorieMap[actionType] !== null) {
            if (this.unitActionCalorieMap[actionType][intensityLevel] !== null) {
                calories += parseInt(playerActionCounts[actionType]) * this.unitActionCalorieMap[actionType][intensityLevel];
            }

        }
    }
    return calories;
}


exports.unitActionFitnessPointsFactorMap = {
    "left-move": {
        "low": 1,
        "medium": 1,
        "high": 1
    },
    "right-move": {
        "low": 1,
        "medium": 1,
        "high": 1
    },
    "jump": {
        "low": 1.5,
        "medium": 1.7,
        "high": 2
    },
    "walk": {
        "low": 0.7,
        "medium": 0.7,
        "high": 0.7
    },
    "running": {
        "low": 1.5,
        "medium": 1.7,
        "high": 2
    },

    "stop": {
        "low": 0.25,
        "medium": 0.25,
        "high": 0.25
    }
}

exports.calculateFitnessPoints = (duration, playerActionCounts, intensityLevel) => {
    let fitnessPoints = 0;
    let totalActionCount = 0;
    for (var actionType in playerActionCounts) {
        //totalActionCount += playerActionCounts[actionType];
        if (this.unitActionFitnessPointsFactorMap[actionType] !== null) {
            if (this.unitActionFitnessPointsFactorMap[actionType][intensityLevel] !== null) {
                totalActionCount += parseInt(playerActionCounts[actionType]) * this.unitActionFitnessPointsFactorMap[actionType][intensityLevel];
            }

        }

    }
    fitnessPoints = totalActionCount * duration / 10;
    return fitnessPoints;
}