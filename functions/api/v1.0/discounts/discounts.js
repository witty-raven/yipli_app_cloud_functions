const UTILITY = require("../utility/utility");

const { getFirestore } = require("firebase-admin/firestore");
const database = getFirestore()

const document = database.collection("Discounts")

console.log("in discounts file");

const DiscountCode = async (params) => {
    
    if (!discountMode.hasOwnProperty(params.discountMode)) return UTILITY.makeError("error", "Invalid mode", UTILITY.httpStatusCodes["Bad Request"]);

    if (!params.code) return UTILITY.makeError("error", "Invalid code", UTILITY.httpStatusCodes["Bad Request"]);

    var response = {};

    if (params.method === "GET") response = await discountMode[params.discountMode](params);
    else if (params.method === "POST") response = await discountMode[params.discountMode](params);
    else if (params.method === "DELETE") response = await discountMode[params.discountMode](params);

    return response || { status: "error", statusCode: UTILITY.httpStatusCodes["No Content"], message: "Request not processed" };
}


const validateDiscountCode = async (params) => {
    console.log("in validateDiscountCode");
    let code = params.code;
    let body = params.body;
    console.log(body,"body in discounts");
    
    await document.onSnapshot(snapshot => snapshot.forEach((snap) => {
        let snapParams = snap.data()
        console.log(snapParams,"snapParams");
        if (code === snapParams.code) {
                
            if (snapParams.status === "expire" || snapParams.status === "pending") {
                return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
                status: "error",
                statusCode: UTILITY.httpStatusCodes["Bad Request"],
                items: "message",
                message: "Coupon expired or used already."
            }, "web");
        }
            switch (snapParams.type) {
                case "FLAT":
                    let flatValue = body["total-payable"] - snapParams.value["integerValue"];
                    
                    body.discount["cart-amount"] = flatValue
                    body.discount["coupon"] = code
                    
                    break;
                case "PERCENT":
                    let percentValue = body["total-payable"] - ((body["total-payable"] / 100) * snapParams.value["integerValue"])
                    body.discount["cart-amount"] = percentValue
                    body.discount["coupon"] = code
                    
                    break;
                default:
                    body.discount["cart-amount"] = body["total-payable"]
                    body.discount["coupon"] = code
                    
                    break;
            }
        }
    }

    ));
    return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"], {
        status: "success",
        statusCode: UTILITY.httpStatusCodes["OK"],
        items: "response",
        response: body,
    }, "web")
}

const applyDiscountCode = async (params) => {
    console.log("in apply");
    validateDiscountCode(params)
}

const deactivateDiscountCode = async (params) => {

}

const checkExpiredCouponCode = async (params) => {

}

const getCouponCode = async () => {

}



exports.requests = {
    discountCode : DiscountCode,
}

const discountMode = {
    "validate": validateDiscountCode,
    "apply": applyDiscountCode,
    "deactivate": deactivateDiscountCode,
    "getCoupon": getCouponCode,
    "expire": checkExpiredCouponCode,
}

