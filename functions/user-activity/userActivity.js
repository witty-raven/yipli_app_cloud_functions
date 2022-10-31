const express = require("express");
const userActivityController = require("./controller");
const userActivity = express();

userActivity.get("/auth/:request", userActivityController.auth);
userActivity.post("/auth/:request", userActivityController.auth);

userActivity.get("/mat/:request", userActivityController.mat);
userActivity.post("/mat/:request", userActivityController.mat);
userActivity.get("/mat/:request", userActivityController.mat);

userActivity.get("/player/:request", userActivityController.player);
userActivity.post("/player/:request", userActivityController.player);
userActivity.delete("/player/:request", userActivityController.player);


exports.http = userActivity;

exports.onCall = async (type, request, query, body) => {
    var req = {};
    var res = {};

    req.params = {
        "request": request
    };
    req.query = query;
    req.body = body;

    return new Promise((resolve, reject) => {
        res.send = (data) => {
            resolve(data);
        }
        userActivityController[type](req, res);
    })

}   