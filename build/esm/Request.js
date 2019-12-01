import { uuid } from "./util";
import { transformRequest, transformResponse } from "./util";
const WORMHOLE_TYPE_CALL = "call";
const WORMHOLE_TYPE_RESULT = "result";
var ERRORS;
(function (ERRORS) {
    ERRORS[ERRORS["ERROR_PARSING_MESSAGE"] = 1] = "ERROR_PARSING_MESSAGE";
    ERRORS[ERRORS["ERROR_CONNECTION"] = 2] = "ERROR_CONNECTION";
    ERRORS[ERRORS["ERROR_CALL"] = 3] = "ERROR_CALL";
    ERRORS[ERRORS["ERROR_PARSING_RESPONSE"] = 4] = "ERROR_PARSING_RESPONSE";
})(ERRORS || (ERRORS = {}));
export default class WormholeRequest {
    constructor(path, request = [], connection) {
        this.callbacks = new Map();
        this.id = uuid();
        // tslint:disable-next-line:variable-name
        this._onConnectionMessage = this.onConnectionMessage.bind(this);
        // tslint:disable-next-line:variable-name
        this._onConnectionError = this.onConnectionError.bind(this);
        this.createPromise();
        this.path = path;
        this.request = this.transformRequest(request);
        this.connection = connection;
        this.connection.on("message", this._onConnectionMessage);
        this.connection.on("error", this._onConnectionError);
        this.send();
    }
    static createError(type, data) {
        const error = new Error(String(data) || ERRORS[type]);
        error.name = ERRORS[type];
        return error;
    }
    then(onFulfilled, onRejected) {
        return this.promise.then(onFulfilled, onRejected);
    }
    catch(onRejected) {
        return this.promise.catch(onRejected);
    }
    finally(onFinally) {
        return this.promise.finally(onFinally);
    }
    send() {
        this.sendMessage(WORMHOLE_TYPE_CALL, { ID: this.id, Ref: this.path, Vars: this.request });
    }
    sendMessage(type, payload) {
        const message = { Payload: payload, Type: type };
        this.connection.send(JSON.stringify(message));
    }
    onConnectionMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.receiveMessage(data);
        }
        catch (e) {
            this.reject(WormholeRequest.createError(ERRORS.ERROR_PARSING_MESSAGE));
            this.onDone();
        }
    }
    receiveMessage(message) {
        if (message.Type === WORMHOLE_TYPE_CALL) {
            this.callCallback(message.Payload);
        }
        else if (message.Type === WORMHOLE_TYPE_RESULT) {
            this.onResult(message.Payload);
        }
    }
    onResult(data) {
        const error = data.Result.Error;
        const Vals = data.Result.Vals;
        try {
            if (error) {
                this.reject(WormholeRequest.createError(ERRORS.ERROR_CALL, error));
            }
            else {
                this.resolve(transformResponse(Vals));
            }
        }
        catch (e) {
            this.reject(WormholeRequest.createError(ERRORS.ERROR_PARSING_RESPONSE));
        }
    }
    onConnectionError() {
        this.reject(WormholeRequest.createError(ERRORS.ERROR_CONNECTION));
        this.onDone();
    }
    callCallback(data) {
        const callback = this.callbacks.get(data.Ref);
        if (!callback) {
            return;
        }
        const args = data.Vars.reduce((res, part) => res.concat(part.slice(1)), []);
        const payload = {
            Call: data.ID,
            Meta: null,
            Result: { Vals: [], Error: "" },
        };
        // @ts-ignore
        Promise.resolve(callback(...args))
            .then((result) => this.transformRequest(result))
            .then((result) => {
            payload.Result.Vals = result;
        })
            .catch((error) => {
            payload.Result.Error = String(error);
        })
            .finally(() => {
            this.sendMessage(WORMHOLE_TYPE_RESULT, payload);
        });
    }
    transformRequest(request) {
        const { payload, callbacks } = transformRequest(request);
        for (const key in callbacks) {
            if (callbacks.hasOwnProperty(key)) {
                this.callbacks.set(key, callbacks[key]);
            }
        }
        return payload;
    }
    onDone() {
        this.connection.off("message", this._onConnectionMessage);
        this.connection.off("error", this._onConnectionError);
    }
    createPromise() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
//# sourceMappingURL=Request.js.map