const UTILITY = require("../utility/utility");

const { getFirestore } = require("firebase-admin/firestore");
const database = getFirestore()


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
const document = database.collection("coupons")

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

exports.requests = {
    generateCoupons : createCoupons,
    getAllCoupons : getAllCouponsFunc,
    updateCoupon : updateCouponStatus,
}