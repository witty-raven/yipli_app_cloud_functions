const express = require("express");
var adminPanelContoller = require("./controller");

const adminPanel = express();


adminPanel.get("/user/:request", adminPanelContoller.user);

adminPanel.get("/product/:request", adminPanelContoller.product);

adminPanel.get("/game/:request", adminPanelContoller.game);

adminPanel.get("/usage/:request", adminPanelContoller.usage);



adminPanel.delete("user/delete", adminPanelContoller.user)

exports.adminPanel = adminPanel;