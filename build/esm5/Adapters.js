"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var isObject = function (val) { return Object.prototype.toString.call(val) === "[object Object]"; };
exports.Request = function (request) {
    var result = { callbacks: {}, payload: {} };
    if (!isObject(request)) {
        result.payload = request;
        return result;
    }
    for (var prop in request) {
        if (request.hasOwnProperty(prop)) {
            var value = request[prop];
            if (typeof value === "function") {
                var id = util_1.uuid();
                result.callbacks[id] = value;
                result.payload[prop] = id;
            }
            else {
                result.payload[prop] = value;
            }
        }
    }
    return result;
};
//# sourceMappingURL=Adapters.js.map