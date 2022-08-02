const UTILITY = require("../utility/utility");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');


dotenv.config();

const accessRole = {
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "admin": 8
}

const accessCategories = {
    "public": "public",
    "auth": "auth"
}

const thirdPartyAuth = {
    authenticate: async function (req) {
        return false;
    },
    role: function (req) {
        return req.params.support;
    }
}

const generateRoleToken = async function (req, res, role, accessCategory) {
    let now = Math.floor(Date.now() / 1000);

    let tokenData = {
        role: role,
        userId: req.body.userId,
        platform: UTILITY.platforms[req.body.platform],
        accessRole: role,
        generatedOn: now,
        exp: calculateExpiry(role, now)
    }

    if(accessCategory && !role === accessRole["zero"]) tokenData.accessCategory = accessCategory;
    else tokenData.accessCategory = accessCategories["public"];

    console.log("Generating token for role: " + role);
    console.log("data: ", tokenData);
    let token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY);
    res.send({ "status": "success", "message": "Token generated", "token": token });
}


const generateToken = async function (req, res) {

    let _thirdPartyAuth = thirdPartyAuth.authenticate(req)
    var token;
    if (!_thirdPartyAuth) token = await generateRoleToken(
        req, 
        res, 
        accessRole.zero, 
        accessCategories["public"]
    );
    else token = await generateRoleToken(
        req, 
        res, 
        accessRole[thirdPartyAuth.role(req)],
        req.body.accessCategory ? accessCategories[ req.body.accessCategory ] : accessCategories["public"]
    );

    return token;
}

const validateToken = async function (req, res) {
    let token = req.headers.authorization;
    if (!token) return { "status": "error",statusCode : 40, "message": "No token provided" };
    if(String(token).substring(0,7) !== "Bearer ") return { "status": "error", "message": "Invalid token" };
    token = String(token).substring(7);
    console.log("Validating token: " + token);

    let decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) return { "status": "error", "message": "Invalid token" };

    let validity = await checkTokenValidity(decoded);
    if (!validity) return { "status": "error", "message": "Token expired" };

    let access = await checkTokenAccess(decoded, req.params.category, req.params.request, req.params.support);
    if (!access) return { "status": "error", "message": "Invalid token access" };

    return { "status": "success", "message": "Token valid", "token": token, "decoded": decoded };

}

const authentcateRequset = {
    generate: generateToken,
    validate: validateToken
}



exports.authenticate = async function (req, res) {
    if (req.params.category === "auth") {
        if (authentcateRequset.hasOwnProperty(req.params.request) && req.method === "POST") {
            let response = await authentcateRequset[req.params.request](req, res);
            if(response.status === "error"){
                
            }
            UTILITY.sendResponse(res, response, UTILITY.httpStatusCodes.OK);
        }
        else {
            res.send({ "status": "error", "message": "Invalid request" });
        }
    }
    else return validateToken(req, res);

}

async function checkTokenValidity(decoded) {
    let now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) return false;
    return true;
}

async function checkTokenAccess(decoded, category, request, support) {
    if(decoded.accessRole === accessRole.admin) return true;

    if(decoded.accessRole === accessRole.zero && (category === accessCategories["public"] || category === accessCategories["auth"])) return true;
    else if(decoded.accessRole === accessRole.one && (category === accessCategories["public"] || category === accessCategories["auth"])) return true;
    else return false;
}

function calculateExpiry(role, now){
    if(role === 0) return Math.floor(new Date(2099,11,31) / 1000);
}