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
    // let code = params.code;
    // let body = params.body;
    // console.log(body,"body in discounts");
    
    // await document.onSnapshot(snapshot => snapshot.forEach((snap) => {
    //     let snapParams = snap.data()
    //     console.log(snapParams,"snapParams");
    //     if (code === snapParams.code) {
                
    //         if (snapParams.status === "expire" || snapParams.status === "pending") {
    //             return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
    //             status: "error",
    //             statusCode: UTILITY.httpStatusCodes["Bad Request"],
    //             items: "message",
    //             message: "Coupon expired or used already."
    //         }, "web");
    //     }
    //         switch (snapParams.type) {
    //             case "FLAT":
    //                 let flatValue = body["total-payable"] - snapParams.value["integerValue"];
                    
    //                 body.discount["cart-amount"] = flatValue
    //                 body.discount["coupon"] = code
                    
    //                 break;
    //             case "PERCENT":
    //                 let percentValue = body["total-payable"] - ((body["total-payable"] / 100) * snapParams.value["integerValue"])
    //                 body.discount["cart-amount"] = percentValue
    //                 body.discount["coupon"] = code
                    
    //                 break;
    //             default:
    //                 body.discount["cart-amount"] = body["total-payable"]
    //                 body.discount["coupon"] = code
                    
    //                 break;
    //         }
    //     }
    // }

    // ));
    // return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"], {
    //     status: "success",
    //     statusCode: UTILITY.httpStatusCodes["OK"],
    //     items: "response",
    //     response: body,
    // }, "web")
}


const applyDiscountCode = async (params) => {
    console.log("in applyDiscountCode");
    let code = params.code;
    let body = JSON.parse(params.body);
    console.log(body,"body in discounts");
    // console.log(body["total-payable"],"body[total-payable]");

    const snapshot = await document.where('code', '=', code).limit(1).get();
    
    // console.log(snapshot,"snapshot");
    if (snapshot.empty) {
        console.log('No matching documents.')
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "Invalid code."
        }, "web");
    }
    const couponData = snapshot.docs[0].data();
    console.log(couponData,"couponData");

    console.log(couponData.validity.from,"couponData.validity.from");
    console.log(couponData.validity.to,"couponData.validity.to");
    console.log(new Date().getTime(),"new Date().getTime()");

    if(couponData.validity.from < new Date().getTime() && couponData.validity.to > new Date().getTime()){
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "Coupon expired."
        }, "web");
    }
    
    if (couponData.status.active <= 0) {
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "Coupon expired or used already."
        }, "web");
    }
    
    // console.log(body["total-payable"],"body[total-payable]");
    if(couponData.type === "FLAT"){
        console.log("in flat",body["total-payable"],couponData.value);
        let flatValue = body["total-payable"] - couponData.value;
        console.log(flatValue,"flatValue");
        body.discount["cartAmount"] = flatValue
        body.discount["coupon"] = code
        body.discount["discountAmount"] = couponData.value;
        body.discount["discountType"] = couponData.type;
    }
    else if(couponData.type === "PERCENT"){
        console.log("in percent", body["total-payable"]);
        let percentValue = body["total-payable"] - ((body["total-payable"] / 100) * couponData.value)
        body.discount["cartAmount"] = percentValue
        body.discount["coupon"] = code
        body.discount["discountAmount"] = ((body["total-payable"] / 100) * couponData.value);
        body.discount["discountType"] = couponData.type;
    }
    else{
        body.discount["cartAmount"] = body["total-payable"]
        body.discount["coupon"] = code
        body.discount["discountAmount"] = 0;
    }
    body.discount["description"] = couponData.description;
    
    // console.log(body,"body in discounts after switch")
    
    // console.log(snapshot.docs[0].id,"snapshot.docs[0].id");


    // await document.doc(snapshot.docs[0].id).update({
    //     status: "pending"
    // })

    return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"], {
        status: "success",
        statusCode: UTILITY.httpStatusCodes["OK"],
        items: "response",
        response: body,
    }, "web")
}

// const applyDiscountCode = async (params) => {
//     console.log("in apply");
//     validateDiscountCode(params)
// }

const deactivateDiscountCode = async (params) => {
    console.log("in deactivateDiscountCode");
    let code = params.code;
    // let body = JSON.parse(params.body);

    console.log("whats up")
    const snapshot = await document.where('code', '=', code).limit(1).get();
    console.log(snapshot,"snapshot");
    if (snapshot.empty) {
        console.log('No matching documents.')
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "Invalid code."
        }, "web");
    }
    const couponData = snapshot.docs[0].data();
    console.log(couponData,"couponData");
    if(couponData.status.active > 0){
        // console.log("in if")
        await document.doc(snapshot.docs[0].id).update({
            status:{
                active: couponData.status.active - 1,
                pending: couponData.status.pending + 1,
                expire: couponData.status.expire
            }
        })
        // console.log("updated")
    }

    return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"], {
        status: "success",
        statusCode: UTILITY.httpStatusCodes["OK"]
    }, "web")
}

const checkExpiredCouponCode = async (params) => {
    console.log("in checkExpiredCouponCode");
    let code = params.code;
    // let body = JSON.parse(params.body);

    console.log("whats up")
    const snapshot = await document.where('code', '=', code).limit(1).get();
    console.log(snapshot,"snapshot");
    if (snapshot.empty) {
        console.log('No matching documents.')
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "Invalid code."
        }, "web");
    }

    const couponData = snapshot.docs[0].data();
    if(couponData.status.active > 0){
        await document.doc(snapshot.docs[0].id).update({
            status:{
                active: couponData.status.active,
                pending: couponData.status.pending - 1,
                expire: couponData.status.expire + 1
            }
        })
    }

    return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"], {
        status: "success",
        statusCode: UTILITY.httpStatusCodes["OK"]
    }, "web")

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

