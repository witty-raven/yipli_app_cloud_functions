const express = require('express');

const api = express();
const VERSIONS = require('./versions');

const apiFunctions = async (req, res) => {

    let version = req.params.ver;
    if(VERSIONS.avalableVersions[version]) {
        let versionPath = `./${VERSIONS.avalableVersions[version]}`;
        const apiController = require(`${versionPath}/controller`);
        switch(req.method) {
            case 'GET':
                await apiController.request.get(req, res);
                break;
            case 'POST':
                await apiController.request.post(req, res);
                break;
            case 'PUT':
                await apiController.request.put(req, res);
                break;
            case 'DELETE':
                await apiController.request.delete(req, res);
                break;
            default:
                res.send(UTILITY.makeError("error", "Request not found", req));
                break;
        }
        
    }
    else {
        res.send("Invalid Version");
    }
    
}

api.get("/:ver/:category/:request/:support", apiFunctions)

api.post("/:ver/:category/:request/:support", apiFunctions)

api.put("/:ver/:category/:request/:support", apiFunctions)

api.delete("/:ver/:category/:request/:support", apiFunctions)

exports.api = api;