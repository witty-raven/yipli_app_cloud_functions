exports.unitActionCalorieMap = {
    "left-move": {
        "low": 2,
        "medium": 2,
        "high": 3
    },
    "right-move": {
        "low": 2,
        "medium": 2,
        "high": 3
    },
    "jump": {
        "low": 4,
        "medium": 5,
        "high": 6
    },
    "walk": {
        "low": 1,
        "medium": 2,
        "high": 2
    },
    "running": {
        "low": 0.3,
        "medium": 0.5,
        "high": 0.7
    },
    "stop": {
        "low": 0.1,
        "medium": 0.1,
        "high": 0.1
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
    return Math.round(calories * 0.2);
}


exports.unitActionFitnessPointsFactorMap = {
    "left-move": {
        "low": 7,
        "medium": 10,
        "high": 13
    },
    "right-move": {
        "low": 7,
        "medium": 10,
        "high": 13
    },
    "jump": {
        "low": 15,
        "medium": 20,
        "high": 25
    },
    "walk": {
        "low": 5,
        "medium": 7,
        "high": 10
    },
    "running": {
        "low": 1,
        "medium": 1.5,
        "high": 2
    },

    "stop": {
        "low": 1,
        "medium": 1,
        "high": 1
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
    fitnessPoints = (totalActionCount + duration) * 5;
    return Math.round(fitnessPoints);
}