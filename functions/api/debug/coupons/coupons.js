const UTILITY = require("../utility/utility");

const { getFirestore } = require("firebase-admin/firestore");
const database = getFirestore()

const document = database.collection("Discounts")
const doc = database.collection("DiscountUsers")

const couponsDetails = async (params) => {
    if (!params || !params.client) return { status: "error", statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "Client not found" };
    if (!params.query.userId) return { status: "error",statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "UserId not found" };

    var response = {};

    if (params.method === "GET") response = await getAllCouponsFunc(params);
    else if (params.method === "POST") response = await createCoupons(params);
    // else if (params.method === "DELETE") response = await deleteLeadsDetails(params);
    
    return response || { status: "error", statusCode: UTILITY.httpStatusCodes["No Content"], message: "Request not processed" };
}

// Obtain a document reference.
// const document = firestore.CollectionReference("leadsGeneration")

const createCoupons = async (req,res) => {
    const {count, type, value, expiresIn} = req;
    let expiresAt;
    if(expiresIn === undefined){
        expiresAt = null;
    }
    else expiresAt = new Date().getTime() + expiresIn * 24 * 60 * 60 * 1000 
    
    const isActive = true;
    let x=[];
    for(let i = 0; i < count; i++) {
        var coupon = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        for (var j = 0; j < 10; j++) {
            coupon += possible.charAt(Math.floor(Math.random() * possible.length));
        }


        let flag = true; 
        await couponRef.get().then((snap)=>{
            snap.forEach((item)=>{
                
                if(item.data().coupon === coupon){
                    i--;
                    flag=false;
                }
            })
        })   
        
        if(flag){
            const couponDetails = {
                coupon,
                isActive,
                type,
                value,
                expiresAt
            }
            const docRef = await couponRef.add(couponDetails);
            // res.send(docRef.id);
            x.push(docRef.id);
        }
    }
    
    res.send(x);
}

const getAllCouponsFunc = async () => {
    const snapshot = await couponRef.get();
    const coupons = [];
    snapshot.forEach(doc => {
        coupons.push(doc.data());
    }); 
    res.send(coupons);
}

const updateCouponStatus = () => {

}

const couponPost = async (req,res) => {
    console.log(req.body,"req.body");

    if(req.body.email===undefined || req.body.email===""){
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "email is required"
        }, "web");
    }

    if(req.body.code===undefined || req.body.code===""){
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "code is required"
        }, "web");
    }

    if(req.body.value===undefined || req.body.value===""){
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "value is required"
        }, "web");
    }

    const snapshot = await document.where('code', '=', req.body.code).limit(1).get();
    
    // console.log(snapshot,"snapshot");
    if (!snapshot.empty) {
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "code is already exist"
        }, "web");
    }

    let couponPosted = await document.add(req.body).then((doc) => {
        // console.log(doc.id,"doc")  

        return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"],{
            status: "success",
            statusCode: UTILITY.httpStatusCodes["OK"],
            items : "response",
            response: {id: doc.id},
        },"web")
        
    }).catch((err) => {
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"],{
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items : "response",
            response: "Invalid"
        },"web")
    })

    return couponPosted;
}

const couponsUpdate = async (req,res) => {
    console.log(req.body,"req.body");

    if(req.body.email===undefined || req.body.email===""){
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "email is required"
        }, "web");
    }

    if(req.body.value===undefined || req.body.value===""){
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "value is required"
        }, "web");
    }

    if(req.body.code===undefined || req.body.code===""){
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "code is required"
        }, "web");
    }

    const snapshot = await document.where('code', '=', req.body.code).limit(1).get();
    
    // console.log(snapshot,"snapshot");
    if (snapshot.empty) {
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "code is not exist"
        }, "web");
    }
    console.log(snapshot.docs[0].data(),"snapshot")

    if(req.body.email!==snapshot.docs[0].data().email){
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "you are not authorized to update this code"
        }, "web");
    }

    let couponUpdated = await document.doc(snapshot.docs[0].id).update(req.body).then((doc) => {

        return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"],{
            status: "success",
            statusCode: UTILITY.httpStatusCodes["OK"],
            items : "response",
            response: "updated",
        },"web")
        
    }).catch((err) => {
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"],{
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items : "response",
            response: "Invalid"
        },"web")
    })

    return couponUpdated;
}



const signupCoupons = async (req,res) => {
    console.log(req.body,"req.body");

    const snapshot = await doc.where('email', '=', req.body.email).limit(1).get();
    
    // console.log(snapshot,"snapshot");
    if (!snapshot.empty) {
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "email is already exist"
        }, "web");
    }

    let couponSignup = await doc.add(req.body).then((doc) => {
        // console.log(doc.id,"doc")  

        return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"],{
            status: "success",
            statusCode: UTILITY.httpStatusCodes["OK"],
            items : "response",
            response: {id: doc.id},
        },"web")
        
    }).catch((err) => {
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"],{
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items : "response",
            response: "Invalid"
        },"web")
    })

    return couponSignup;
}

const signinCoupons = async (req,res) => {
    console.log(req.body,"req.body");

    const snapshot = await doc.where('email', '=', req.body.email).limit(1).get();
    
    // console.log(snapshot,"snapshot");
    if (snapshot.empty) {
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "email is not exist"
        }, "web");
    }

    if(req.body.password!==snapshot.docs[0].data().password){
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"], {
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items: "message",
            message: "password is not correct"
        }, "web");
    }

    return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"],{
        status: "success",
        statusCode: UTILITY.httpStatusCodes["OK"],
        items : "response",
        response: "logged in",
    },"web")


}
const getCouponsAll = async (req,res) => {
    console.log("ABC")
    const snapshot = await document.get()
    
    const allCoupons = snapshot.docs.map(doc => doc.data())

    return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"],{
        status: "success",
        statusCode: UTILITY.httpStatusCodes["OK"],
        items : "response",
        response: "logged in",
        allCoupons: allCoupons
    },"web")
    
}





exports.requests = {
    generateCoupons : createCoupons,
    getAllCoupons : getAllCouponsFunc,
    updateCoupon : updateCouponStatus,
    couponPost : couponPost,
    couponUpdate : couponsUpdate,
    signupCoupons : signupCoupons,
    signinCoupons : signinCoupons,
    getCouponsAll : getCouponsAll,
}