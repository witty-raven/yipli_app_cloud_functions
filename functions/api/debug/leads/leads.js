const UTILITY = require("../utility/utility");

const {getFirestore} = require("firebase-admin/firestore");
const database = getFirestore()

const document = database.collection("leadsGeneration")

const LeadDetails = async (params) => {

    if (!params || !params.client) 
        return {status: "error", statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "Client not found"};
    

    var response = {};

    if (params.method === "GET") 
        response = await getLeadsDetails(params);
     else if (params.method === "POST") 
        response = await createLeadsDetails(params);
     else if (params.method === "DELETE") 
        response = await deleteLeadsDetails(params);
    


    return response || {
        status: "error",
        statusCode: UTILITY.httpStatusCodes["No Content"],
        message: "Request not processed"
    };

}

// Obtain a document reference.
// const document = firestore.CollectionReference("leadsGeneration")

const createSession = async (params) => {
    // Enter new data into the document.
    console.log("createSession",params)
    // params.body = JSON.parse(params.body);
    // console.log(params.body,"body")

    let leadCreated = await document.add({}).then((doc) => {
        console.log(doc.id,"doc")  

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

    return leadCreated;

}


const createLeadsDetails = async (params) => {
    // Enter new data into the document.
    // console.log(params.body,"first body")
    params.body = JSON.parse(params.body);
    console.log(params,"body")

    let leadCreated = await document.doc(params.query.userid).set(params.body,{ merge: true }).then((doc) => {
        return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"],{
            status: "success",
            statusCode: UTILITY.httpStatusCodes["OK"],
            items : "response",
            response: params,
        },"web")
        
    }).catch((err) => {
            return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"],{
                status: "error",
                statusCode: UTILITY.httpStatusCodes["Bad Request"],
                items : "response",
                response: "Invalid code"
            },"web")
    })
    
    return leadCreated;
   
}






const  getLeadsDetails = async (params) => {

    console.log(params.query.userid,"body")

    let response = await document.doc(params.query.userid).get().then((doc) => {
        console.log(doc.data())
        return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"],{
            status: "success",
            statusCode: UTILITY.httpStatusCodes["OK"],
            items : "response",
            response: doc.data(),
        },"web")
        
    }).catch((err) => {
        return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"],{
            status: "error",
            statusCode: UTILITY.httpStatusCodes["Bad Request"],
            items : "response",
            response: "Invalid code"
        },"web")
    })

    
    return response;
   
}


const createLeadsDetails3 = async (params) => {
    // Enter new data into the document.
    params.body = JSON.parse(params.body);
    console.log(params.body,"body")

    // let leadCreated = await document.doc().set(params).then((doc) => {
    //     if(UTILITY.isEmpty(doc)) return { status: "error", name: "doc not found" };
    //     return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"],{
    //         status: "success",
    //         statusCode: UTILITY.httpStatusCodes["OK"],
    //         items : "response",
    //         response: params,
    //     },"web")
        
    // }).catch((err) => {
    //     return UTILITY.makeError(UTILITY.httpStatusCodes["Bad Request"],{
    //         status: "error",
    //         statusCode: UTILITY.httpStatusCodes["Bad Request"],
    //         items : "response",
    //         response: "Invalid code"
    //     },"web")
    // })

    
    return UTILITY.makeResponse(UTILITY.httpStatusCodes["OK"],{
        status: "success",
        statusCode: UTILITY.httpStatusCodes["OK"],
        items : "response",
        response: params,
    },"web")
}

const createLeadsDetails1 = async (params) => {
    params.body = JSON.parse(params.body);
    console.log(params.body,"body")
    let leadsDetailsList = (params.body);
    
    let createdLeadsDetailsPromises = [];
    let leadsDetails = []
    Object.keys(leadsDetailsList).forEach((key, i) => {
        console.log("key", key);
        leadsDetails.push(Object.keys(leadsDetailsList))
        // console.log(leadsDetails,"leadDetails");
        if (createLeadsDetailsList.hasOwnProperty(key)) {
            console.log("here");
            createdLeadsDetailsPromises.push(createLeadsDetailsList[key](params.body));
            // return createdLeadsDetailsPromises;
        }

    })
    console.log(createdLeadsDetailsPromises,"createdLeadsDetailsPromises")
    let leadsDetailsObj = await Promise.all(createdLeadsDetailsPromises);
    // console.log(leadsDetailsObj,"leadsDetailsObj");

    let leadsDetailsObjectResponse = {};
    for (let i = 0; i < leadsDetailsObj.length; i++) {
        if (leadsDetailsObj[i].status === "error") {
            leadsDetailsObjectResponse[leadsDetailsList[i]] = "NA";
            // return leadsDetailsObjectResponse;
        } else {
            leadsDetailsObjectResponse[leadsDetailsList[i]] = leadsDetailsObj[i][leadsDetailsList[i]];
            // return leadsDetailsObjectResponse;
        }

    }

    // let response = {
    //     status: "success",
    //     message: "Leads Details created",
    //     items: "leadsDetails",
    //     leadsDetails: leadsDetailsList
    // };
    // return response;

    
    return {
        status: "success",
        message: "Leads Details created",
        items: "leadsDetails",
        leadsDetails: leadsDetailsList
    }

    // return leadsDetailsList
}


const createLeadsDetails2 = async (params) => {

    let leadsDetailsList = String(params.body).split(",") || [];
    let createdLeadsDetailsPromises = [];
    let leadsDetails = []
    leadsDetailsList.forEach((each, i) => {
        leadsDetails.push(Object.keys(leadsDetailsList))
        console.log(leadsDetails,"leadDetails");
        if (createLeadsDetailsList.hasOwnProperty(leadsDetails) && i === leadsDetailsList.length - 2) {
            createdLeadsDetailsPromises.push(createLeadsDetailsList[leadsDetails](params.body));
            // return createdLeadsDetailsPromises;
        }

    })

    let leadsDetailsObj = await Promise.all(createdLeadsDetailsPromises);


    let leadsDetailsObjectResponse = {};
    for (let i = 0; i < leadsDetailsObj.length; i++) {
        if (leadsDetailsObj[i].status === "error") {
            leadsDetailsObjectResponse[leadsDetailsList[i]] = "NA";
            // return leadsDetailsObjectResponse;
        } else {
            leadsDetailsObjectResponse[leadsDetailsList[i]] = leadsDetailsObj[i][leadsDetailsList[i]];
            // return leadsDetailsObjectResponse;
        }

    }

    // let response = {
    //     status: "success",
    //     message: "Leads Details created",
    //     items: "leadsDetails",
    //     leadsDetails: leadsDetailsList
    // };

    // return {
    //     status: "success",
    //     message: "Leads Details created",
    //     items: "leadsDetails",
    //     leadsDetails: leadsDetailsList
    // }
    // return response;

    return leadsDetailsList
}













// not working though
const createLeadFirstName = async (params) => { // let firstName = await UTILITY.database.user.read.name(userId);
    let body = params["firstname"];
    console.log(params,"firstname")  
    let firstName = await document.doc().set(params).then((doc) => {


        if (UTILITY.isEmpty(firstName, "string")) 
            return {status: "error", name: "First name not found"};
        


        return {status: "success", name: body};
    }).catch((err) => {
        return {status: "error", name: "First name not found"};
    })
    return {status: "success", name: body};
}

const createLeadLastName = async (params) => { // if(UTILITY.isEmpty(lastName, "string")) return { status: "error", name: "First name not found" };
    let body = params["lastname"]
    let lastName = await document.doc().set(params).then((doc) => {

        if (UTILITY.isEmpty(lastName, "string")) 
            return {status: "error", name: "Last name not found"};
        

        return {status: "success", name: body};
    }).catch((err) => {
        return {status: "error", name: "Last name not found"};
    })
    return {status: "success", name: body};
}

const createLeadMobileNo = async (params) => {
    let body = params["mobile"]
    let mobile = await document.doc().set(params).then((doc) => {

        if (UTILITY.isEmpty(mobile, "string")) 
            return {status: "error", name: "Mobile no not found"};
        

        return {status: "success", name: body};
    }).catch((err) => {
        return {status: "error", name: "Mobile No not found"};
    })
    return {status: "success", name: body};

}

const createLeadEmail = async (params) => {
    let body = params["email"]
    let email = await document.doc().set(params).then((doc) => {

        if (UTILITY.isEmpty(email, "string")) 
            return {status: "error", name: "Email ID not found"};
        

        return {status: "success", name: body};
    }).catch((err) => {
        return {status: "error", name: "Email ID not found"};
    })
    return {status: "success", name: body};
}

const createLeadAddress = async (params) => {


    let body = params["address1"]
    let address1 = await document.doc().set(params).then((doc) => {

        if (UTILITY.isEmpty(address1, "string")) 
            return {status: "error", name: "Address1 not found"};
        


        return {status: "success", name: body};


    }).catch((err) => {
        return {status: "error", name: "Address1 not found"};
    })
    return {status: "success", name: body};
}

const createLeadOptionalAddress = async (params) => {


    let body = params["address2"]

    let address2 = await document.doc().set(params).then((doc) => {

        if (UTILITY.isEmpty(address2, "string")) 
            return {status: "error", name: "Address2 not found"};
        


        return {status: "success", name: body};


    }).catch((err) => {
        return {status: "error", name: "Address2 not found"};
    })
    return {status: "success", name: body};
}

const createLeadZip = async (params) => {


    let body = params["zip"]
    let zip = await document.doc().set(params).then((doc) => {

        if (UTILITY.isEmpty(zip, "string")) 
            return {status: "error", name: "zip not found"};
        


        return {status: "success", name: body};


    }).catch((err) => {
        return {status: "error", name: "zip not found"};
    })
    return {status: "success", name: body};
}

const createLeadCountry = async (params) => {


    let body = params["country"]
    let country = await document.doc().set(params).then((doc) => {

        if (UTILITY.isEmpty(country, "string")) 
            return {status: "error", name: "country not found"};
        


        return {status: "success", name: body};


    }).catch((err) => {
        return {status: "error", name: "country not found"};
    })
    return {status: "success", name: body};
}

const createLeadState = async (params) => {


    let body = params["state"]
    let state = await document.doc().set(params).then((doc) => {

        if (UTILITY.isEmpty(state, "string")) 
            return {status: "error", name: "state not found"};
        


        return {status: "success", name: body};


    }).catch((err) => {
        return {status: "error", name: "state not found"};
    })
    return {status: "success", name: body};
}

const createLeadCity = async (params) => {
    let body = params["city"]
    let city = await document.doc().set(params).then((doc) => {
        if (UTILITY.isEmpty(city, "string")) 
            return {status: "error", name: "city not found"};
        
        return {status: "success", name: body};
    }).catch((err) => {
        return {status: "error", name: "city not found"};
    })
    return {status: "success", name: body};
}


const getLeadsDetails1 = async (params) => {

    // let userId = params.query.userId;
    // if(UTILITY.isEmpty(params.query.details, "string") || UTILITY.isEmpty(userId, "string")) return { status: "error", statusCode: UTILITY.httpStatusCodes["Not Acceptable"], message: "UserId or details not found" };
    let leadsDetailsList = String(params.query.details).split(",") || [];

    // if (UTILITY.isEmpty(userId, "string") || UTILITY.isEmpty(leadsDetailsList, "array")) {
    //     return {status: "error", message: "UserId or details not found"};
    // }


    let leadsDetailsPromises = [];

    for (let i = 0; i < leadsDetailsList.length; i++) {
        let leadsDetails = leadsDetailsList[i];
        if (getLeadsDetailsList.hasOwnProperty(leadsDetails)) {
            leadsDetailsPromises.push(getLeadsDetailsList[leadsDetails](userId, params));
        }
    }

    let leadsDetailsObj = await Promise.all(leadsDetailsPromises);
    let leadsDetails = {};
    for (let i = 0; i < leadsDetailsObj.length; i++) {
        if (leadsDetailsObj[i].status === "error") 
            leadsDetails[leadsDetailsList[i]] = "NA";
         else 
            leadsDetails[leadsDetailsList[i]] = leadsDetailsObj[i][leadsDetailsList[i]];
        


    }
    // console.log("Hello")
    let response = {
        status: "success",
        message: "Leads Details",
        items: "leadsDetails",
        leadsDetails: leadsDetails
    };
    return response;


}


const deleteLeadsDetails = async (params) => {
    // Delete the document.
    // await document.doc("newCreatedLeads").delete();

}

const getLeadFirstName = async (params) => { // let firstName = await UTILITY.database.user.read.name(userId);
    let firstName = await document.doc().get()

    if (UTILITY.isEmpty(firstName, "string")) 
        return {status: "error", name: "First name not found"};
    


    return {status: "success", name: firstName};
}

const getLeadLastName = async (params) => {
    let lastName = await document.doc().get()

    if (UTILITY.isEmpty(lastName, "string")) 
        return {status: "error", name: "First name not found"};
    


    return {status: "success", name: lastName};
}

const getLeadMobileNo = async (params) => {
    let mobile = await document.doc().get()

    if (UTILITY.isEmpty(mobile, "string")) 
        return {status: "error", name: "First name not found"};
    


    return {status: "success", name: mobile};
}

const getLeadEmail = async (params) => {
    let email = await document.doc().get()

    if (UTILITY.isEmpty(email, "string")) 
        return {status: "error", name: "First name not found"};
    


    return {status: "success", name: email};
}

const getLeadAddress = async (params) => {
    let address1 = await document.doc().get()

    if (UTILITY.isEmpty(address1, "string")) 
        return {status: "error", name: "First name not found"};
    


    return {status: "success", name: address1};
}

const getLeadOptionalAddress = async (params) => {
    let address2 = await document.doc().get()

    if (UTILITY.isEmpty(address2, "string")) 
        return {status: "error", name: "First name not found"};
    


    return {status: "success", name: address2};
}

const getLeadZip = async (params) => {
    let zip = await document.doc().get()

    if (UTILITY.isEmpty(zip, "string")) 
        return {status: "error", name: "First name not found"};
    


    return {status: "success", name: zip};
}

const getLeadCountry = async (params) => {
    let country = await document.doc().get()

    if (UTILITY.isEmpty(country, "string")) 
        return {status: "error", name: "First name not found"};
    


    return {status: "success", name: country};
}

const getLeadState = async (params) => {
    let state = await document.doc().get()

    if (UTILITY.isEmpty(state, "string")) 
        return {status: "error", name: "First name not found"};
    


    return {status: "success", name: state};
}

const getLeadCity = async (params) => {
    let city = await document.doc().get()

    if (UTILITY.isEmpty(city, "string")) 
        return {status: "error", name: "First name not found"};
    


    return {status: "success", name: city};
}

exports.requests = {
    leadDetails: LeadDetails,
    createSession: createSession,
}

// not working though
const createLeadsDetailsList = {
    "firstname": createLeadFirstName,
    "lastname": createLeadLastName,
    "mobile": createLeadMobileNo,
    "email": createLeadEmail,
    "address1": createLeadAddress,
    "address2": createLeadOptionalAddress,
    "zip": createLeadZip,
    "country": createLeadCountry,
    "state": createLeadState,
    "city": createLeadCity
}

const getLeadsDetailsList = {
    "firstname": getLeadFirstName,
    "lastname": getLeadLastName,
    "mobile": getLeadMobileNo,
    "email": getLeadEmail,
    "address1": getLeadAddress,
    "address2": getLeadOptionalAddress,
    "zip": getLeadZip,
    "country": getLeadCountry,
    "state": getLeadState,
    "city": getLeadCity
}
