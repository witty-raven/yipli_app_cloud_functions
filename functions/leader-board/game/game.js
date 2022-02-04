const firebase = require("firebase-admin");
const UTILITY = require("../utility/utility");
const REQUEST = "Game Leader Board"

const getGameResult = async (query) =>{
    const gameId = query.gameId;

    var refToResult = firebase.database().ref(UTILITY.paths["pathToLeaderBoards"] + "game/" + gameId);
    var refToInventory = firebase.database().ref(UTILITY.paths["pathToLeaderBoardsInventory"] + "game/" + gameId)
    var gameInfo = await refToInventory.once("value");
    var refToTeamplates = firebase.database().ref(UTILITY.paths["pathToLeaderBoardsInventory"] + "templates/" + gameInfo.child("template").val());
    var template = await refToTeamplates.once("value");

    var game = gameInfo.val();
    game.template = template.val();
    game["banner-url"] = UTILITY.constructPublicURL(UTILITY.baseURLs["storageURL"], game["banner-url"], UTILITY.mediaType["media"]);
    
    return new Promise((resolve,reject) => {
        refToResult.once("value").then(itemList=>{
            var List = [];
            itemList.forEach(item=>{
                var obj = item.val()
                obj["display-img-url"] = UTILITY.constructPublicURL(UTILITY.baseURLs["storageURL"] ,obj["display-img-url"], UTILITY.mediaType["media"]);
                obj.id = item.key;
                List.push(obj);
            })
            game.result = List;
            resolve(game);
        })
    })
}

const getGameList = async (query) =>{
    return new Promise((resolve,reject) => resolve("working " + REQUEST))
}

exports.request = {
    'list' : getGameList,
    'result' : getGameResult
}