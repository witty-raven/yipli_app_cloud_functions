const UTILITY = require("../utility/utility");
const DEFS = require("../definations/definations");
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
        if (!req.body.firebaseAuth) return false;
        let firebaseAuth = req.body.firebaseAuth;
        if(!firebaseAuth.hasOwnProperty("token")) return false;
        if(!firebaseAuth.includes("Bearer ")) return false;
        let firebaseToken = firebaseAuth.split("Bearer ")[1];
        let firebaseDecoded = await UTILITY.firebaseAuth.decode(firebaseToken);
        if(firebaseDecoded.hasOwnProperty("uid")) return true;
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

    
    
    let token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY);
    return token;
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

    UTILITY.sendResponse(res, { "status": "success", "message": "Token generated", "token": token }, UTILITY.httpStatusCodes.OK);

    return token;
}

const validateToken = async function (req, res) {
    let token = req.headers.authorization;
    if(req.params.category === "public" && req.method === "GET" && !token){
        
        if(DEFS.unprotectedRequests.includes(req.params.request)) return {"status" : "success", token : await generateRoleToken(req, res, accessRole.zero, accessCategories["public"]), type : "cookie"};
        else return UTILITY.sendResponse(res, { "status": "error", "message": "Invalid request" }, UTILITY.httpStatusCodes.Unauthorized);
    }
    if (!token) return { "status": "error",statusCode : 400, "message": "No token provided" };
    if(String(token).substring(0,7) !== "Bearer ") return { "status": "error", "message": "Invalid token" };
    token = String(token).substring(7);

    let decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) return { "status": "error", "message": "Invalid token" };

    let validity = await checkTokenValidity(decoded);
    if (!validity) return { "status": "error", "message": "Token expired" };

    let access = await checkTokenAccess(decoded, req.params.category, req.params.request, req.params.support);
    if (!access) return { "status": "error", "message": "Invalid token access" };

    decoded = removeTokenSensitiveData(decoded);

    return { "status": "success", "message": "Token valid","items" : "token,decoded", "token": token, "decoded": decoded };

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

function removeTokenSensitiveData(decoded){
    delete decoded.exp;
    delete decoded.iat;
    delete decoded.nbf;
    delete decoded.jti;
    return decoded;
}