import { uuid } from "./util";
const isObject = (val) => Object.prototype.toString.call(val) === "[object Object]";
export const Request = (request) => {
    const result = { callbacks: {}, payload: {} };
    if (!isObject(request)) {
        result.payload = request;
        return result;
    }
    for (const prop in request) {
        if (request.hasOwnProperty(prop)) {
            const value = request[prop];
            if (typeof value === "function") {
                const id = uuid();
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