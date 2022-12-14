const express = require('express');
const cors = require('cors');

const UTILITY = require("./v1.0/utility/utility")

const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
}

const api = express();
const VERSIONS = require('./versions');


const apiFunctions = async (req, res) => {
    try {
        let version = req.params.ver;
        if (VERSIONS.avalableVersions[version]) {
            let versionPath = `./${VERSIONS.avalableVersions[version]}`;
            const apiController = require(`${versionPath}/controller`);
            
            switch (req.method) {
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
    catch (err) {
        
        res.status(500).send({ status: "error", message: "Internal Server Error" });
    }
    
}

api.all("/:ver/:category/:request/:support", apiFunctions);


api.use((req, res) => { 
    res.status(404).send({ status: "error", message: "Not Found" });
})
api.use((err, req, res) => {
    
    res.status(500).send({ status: "error", message: "Internal Server Error" });
})

api.use(cors(corsOptions));
// api.use(cors())

exports.api = api;
