var client = {
    ENTER: "ENTER",
    AUTH: "AUTH",
    MSG: "MSG",
    TRANSFER: "TRANSFER",
    SUCCESS: {
        TRANSFER: "SUCCESS_TRANSFER"
    }
};
var server = {
    ERROR: {
        REQUEST: 'INVALID REQUEST',
        SESSION: 'SESSION NOT VALIDATED',
        OVERFLOW: 'OVERFLOW MESSAGE',
        EXCEPT: 'UNKNOWN ERROR'
    },
    JOIN: "JOIN",
    MSG: "MSG",
    TRANSFER: "TRANSFER",
    LEAVE: "LEAVE",
    SUCCESS: {
        ENTER: "SUCCESS_ENTER",
        AUTH: "SUCCESS_AUTH",
        MSG: "SUCCESS_MSG",
        TRANSFER: "SUCCESS_TRANSFER"
    }
};

var userType = {
    CUSTOMER: 'CUSTOMER',
    MEMBER: 'MEMBER'
};
