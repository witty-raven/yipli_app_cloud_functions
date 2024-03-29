console.log("in defination");
exports.categories = {
    "auth" : "./auth/auth",
    "public" : "./public/public",
    "user" : "./user/user",
    "game" : "./game/game",
    "fgd" : "./fgd/fgd",
    "payments" : "./payments/payments",
    "discounts" : "./discounts/discounts",
    "leads" : "./leads/leads",
    "coupons" : "./coupons/coupons"
}

exports.categoryRequests = {
    "auth" : [],
    "public" : ["urls", "isAlive", "fcmToken"],
    "user" : ["details"],
    "game" : ["details"],
    "fgd" : ["read"],
    "payments" : ["razorPay"],
    "discounts" : ["discountCode"],
    "leads" : ["leadDetails","read","update","delete"],
    "coupons" : ["generateCoupons","getAllCoupons","updateCoupon"],
    
}
exports.unprotectedRequests = ["isAlive", "urls", "razorPay","leadDetails","generateCoupons","discountCode"];

