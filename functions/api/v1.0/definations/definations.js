exports.categories = {
    "auth" : "./auth/auth",
    "public" : "./public/public",
    "user" : "./user/user",
    "game" : "./game/game",
}

exports.categoryRequests = {
    "auth" : [],
    "public" : ["urls", "isAlive", "fcmToken"],
    "user" : ["details"],
    "game" : ["details"]
}

