const express = require("express");

var leaderBoardController = require("./controller");
const { httpStatusCodes } = require("./utility/utility");

const leaderBoard = express();


leaderBoard.get("/game/:request/:gameId", leaderBoardController.game);

leaderBoard.get("/campaign/:request/:campaignId", leaderBoardController.campaign);
leaderBoard.get("/campaign/:request/:campaignId/:userId", leaderBoardController.campaign);

leaderBoard.post("/campaign/:request", async(req, res)=> {
    await leaderBoardController.postSession(req.body);
    res.send(req.body);
});



exports.http = leaderBoard;

exports.postSession = leaderBoardController.postSession;