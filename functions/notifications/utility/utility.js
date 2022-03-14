const nullCheck = (data) => {
    if (data) return true;
    else return false;
}

exports.checks = {
    "null-check": nullCheck,
}

exports.httpStatusCodes = {
    "Continue": 100,
    "Switching Protocols": 101,
    "Processing": 102,
    "OK": 200,
    "Created": 201,
    "Accepted": 202,
    "Non-authoritative Information": 203,
    "No Content": 204,
    "Reset Content": 205,
    "Partial Content": 206,
    "Multi-Status": 207,
    "Already Reported": 208,
    "IM Used": 226,
    "Multiple Choices": 300,
    "Moved Permanently": 301,
    "Found": 302,
    "See Other": 303,
    "Not Modified": 304,
    "Use Proxy": 305,
    "Temporary Redirect": 307,
    "Permanent Redirect": 308,
    "Bad Request": 400,
    "Unauthorized": 401,
    "Payment Required": 402,
    "Forbidden": 403,
    "Not Found": 404,
    "Method Not Allowed": 405,
    "Not Acceptable": 406,
    "Proxy Authentication Required": 407,
    "Request Timeout": 408,
    "Conflict": 409,
    "Gone": 410,
    "Length Required": 411,
    "Precondition Failed": 412,
    "Payload Too Large": 413,
    "Request-URI Too Long": 414,
    "Unsupported Media Type": 415,
    "Requested Range Not Satisfiable": 416,
    "Expectation Failed": 417,
    "I'm a teapot": 418,
    "Misdirected Request": 421,
    "Unprocessable Entity": 422,
    "Locked": 423,
    "Failed Dependency": 424,
    "Upgrade Required": 426,
    "Precondition Required": 428,
    "Too Many Requests": 429,
    "Request Header Fields Too Large": 431,
    "Connection Closed Without Response": 444,
    "Unavailable For Legal Reasons": 451,
    "Client Closed Request": 499,
    "Internal Server Error": 500,
    "Not Implemented": 501,
    "Bad Gateway": 502,
    "Service Unavailable": 503,
    "Gateway Timeout": 504,
    "HTTP Version Not Supported": 505,
    "Variant Also Negotiates": 506,
    "Insufficient Storage": 507,
    "Loop Detected": 508,
    "Not Extended": 510,
    "Network Authentication Required": 511,
    "Network Connect Timeout Error": 599
}

exports.paths = {
    'pathToUser': "/profiles/users/",
    'pathToUserStats': "/user-stats/",
    'pathToSessions': "/sessions/game-sessions/",
    'pathToGameInventory': "/inventory/games/",
    'pathToLeaderBoards': "/leader-boards/",
    'pathToLeaderBoardsInventory': "/inventory/leader-boards/",
    'pathToNotificationsInventory': '/inventory/notifications/List/dueNotifications/',
    "pathToNotificationTemplates": "/inventory/notifications/templates/",
    "pathToFcmTokens": "/fcm-tokens/",
    "pathToNotificationsHistory": "/inventory/notifications/List/history/"
}

exports.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

exports.baseURLs = {
    'storageURL': "https://firebasestorage.googleapis.com/v0/b/yipli-project.appspot.com/o/"
}

exports.mediaType = {
    'text': "?alt=text",
    'media': "?alt=media"
}

exports.constructPublicURL = (baseUrl, path, mediaType) => {
    const encodedPath = String(path).replace(/\//g, "%2F");
    return (baseUrl + encodedPath + mediaType);
}
