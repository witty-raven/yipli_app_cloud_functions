const UTILITY = require("../utility/utility");

const Razorpay = require("razorpay")

const { getFirestore } = require("firebase-admin/firestore");
const database = getFirestore()

const document = database.collection("Discounts")
const doc = database.collection("Orders")

const RazorpayParent = async (params) => {

    if (!razorpayMode.hasOwnProperty(params.razorpayMode))
        return UTILITY.makeError("error", "Invalid mode", UTILITY.httpStatusCodes["Bad Request"]);



    if (params.method === "GET")
        response = await razorpayMode[params.razorpayMode](params);
    else if (params.method === "POST")
        response = await razorpayMode[params.razorpayMode](params);


    return response || {
        status: "error",
        statusCode: UTILITY.httpStatusCodes["No Content"],
        message: "Request not processed"
    };
}


const instance = new Razorpay({ 
    key_id: process.env.RAZORPAY_KEY_ID, 
    key_secret: process.env.RAZORPAY_KEY_SECRET
})


const createRazorpayOrder = async (params) => {
    let body = JSON.parse(params.body)
    console.log(body, "razorpay body")
    let discount = body.discount

    const payment_capture = body["total-qty"]
    let amount = body["total-payable"]
    const currency = 'INR'

    const options = { // amount: (discount["cart-amount"])*100,
        amount: amount * 100,
        currency,
        receipt: "rcp_1",
        payment_capture
    }

    try {
        const response = await instance.orders.create(options)
        return response;
    } catch (error) {
        console.log(error,"error in catch create razorpay order");
     }

}

const verifyRazorpayPayment = async (params) => {
    // do a validation
    // const secret = '12345678'


    const crypto = require('crypto')

    const shasum = crypto.createHmac('sha256')
    shasum.update(JSON.stringify(params.body))
    const digest = shasum.digest('hex')


    if (digest === params.headers['x-razorpay-signature']) { // process it
        require('fs').writeFileSync('payment1.json', JSON.stringify(params, null, 4))


    }
    // return({ status: 'ok' })

    return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"], {
        status: "success",
        statusCode: UTILITY.httpStatusCodes["OK"],
        items: message,
        message: "payment.json has been created"
    }, "web")

}

const orderDetails = async (params) => {
    params.body = JSON.parse(params.body);
    let orderAdded = await doc.doc(params.body.userId).set(params.body,{ merge: true }).then((doc) => {
        return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"],{
            status: "success",
            statusCode: UTILITY.httpStatusCodes["OK"],
            items : "response",
            response: params.body,
        },"web")
        
    }).catch((err) => {
            return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"],{
                status: "error",
                statusCode: UTILITY.httpStatusCodes["Bad Request"],
                items : "response",
                response: "Invalid code"
            },"web")
    })


    return orderAdded;
}


exports.requests = {
    razorPay: RazorpayParent
}


const razorpayMode = {
    "create": createRazorpayOrder,
    "verify": verifyRazorpayPayment,
    "order": orderDetails
}
