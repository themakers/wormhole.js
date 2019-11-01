"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuid = function () {
    var mask = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    // tslint:disable-next-line:no-bitwise
    return mask.replace(/[xy]/g, function (c, r) { return ("x" === c ? (r = Math.random() * 16 | 0) : (r & 0x3 | 0x8)).toString(16); });
};
exports.transformResponse = function (response) {
    var result = {};
    response.forEach(function (_a) {
        var key = _a[0], value = _a[1];
        result[key] = value;
    });
    return result;
};
exports.transformRequest = function (request) {
    var result = { callbacks: {}, payload: [] };
    if (typeof request === "string") {
        result.payload.push(["", request]);
        return result;
    }
    for (var prop in request) {
        if (request.hasOwnProperty(prop)) {
            var value = request[prop];
            if (typeof value === "function") {
                var id = exports.uuid();
                result.callbacks[id] = value;
                result.payload.push([prop, id]);
            }
            else {
                result.payload.push([prop, value]);
            }
        }
    }
    return result;
};
//# sourceMappingURL=util.js.map