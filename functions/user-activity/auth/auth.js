
const login = async (query) => {
    return "login worked";
}

const logout = async (query) => {
    //To Do:- Add handling of logout action
    return "logout worked";
}



exports.requests = {
    "login": login,
    "logout": logout,
}