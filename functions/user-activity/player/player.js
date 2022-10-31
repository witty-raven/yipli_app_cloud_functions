
const add = async (query) => {
    return "Player added ";
}

const delete_ = async (query) => {
    return "Player removed";
}
exports.requests = {
    "add": add,
    "get": "get",
    "update": "update",
    "remove": delete_
}