"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var util_2 = require("./util");
var WORMHOLE_TYPE_CALL = "call";
var WORMHOLE_TYPE_RESULT = "result";
var ERRORS;
(function (ERRORS) {
    ERRORS[ERRORS["ERROR_PARSING_MESSAGE"] = 1] = "ERROR_PARSING_MESSAGE";
    ERRORS[ERRORS["ERROR_CONNECTION"] = 2] = "ERROR_CONNECTION";
    ERRORS[ERRORS["ERROR_CALL"] = 3] = "ERROR_CALL";
    ERRORS[ERRORS["ERROR_PARSING_RESPONSE"] = 4] = "ERROR_PARSING_RESPONSE";
})(ERRORS || (ERRORS = {}));
var WormholeRequest = /** @class */ (function () {
    function WormholeRequest(path, request, connection) {
        if (request === void 0) { request = []; }
        this.callbacks = new Map();
        this.id = util_1.uuid();
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
    WormholeRequest.createError = function (type, data) {
        var error = new Error(String(data) || ERRORS[type]);
        error.name = ERRORS[type];
        return error;
    };
    WormholeRequest.prototype.then = function (onFulfilled, onRejected) {
        return this.promise.then(onFulfilled, onRejected);
    };
    WormholeRequest.prototype.catch = function (onRejected) {
        return this.promise.catch(onRejected);
    };
    WormholeRequest.prototype.finally = function (onFinally) {
        return this.promise.finally(onFinally);
    };
    WormholeRequest.prototype.send = function () {
        this.sendMessage(WORMHOLE_TYPE_CALL, { ID: this.id, Ref: this.path, Vars: this.request });
    };
    WormholeRequest.prototype.sendMessage = function (type, payload) {
        var message = { Payload: payload, Type: type };
        this.connection.send(JSON.stringify(message));
    };
    WormholeRequest.prototype.onConnectionMessage = function (event) {
        try {
            var data = JSON.parse(event.data);
            this.receiveMessage(data);
        }
        catch (e) {
            this.reject(WormholeRequest.createError(ERRORS.ERROR_PARSING_MESSAGE));
            this.onDone();
        }
    };
    WormholeRequest.prototype.receiveMessage = function (message) {
        if (message.Type === WORMHOLE_TYPE_CALL) {
            this.callCallback(message.Payload);
        }
        else if (message.Type === WORMHOLE_TYPE_RESULT) {
            this.onResult(message.Payload);
        }
    };
    WormholeRequest.prototype.onResult = function (data) {
        var error = data.Result.Error;
        var Vals = data.Result.Vals;
        try {
            if (error) {
                this.reject(WormholeRequest.createError(ERRORS.ERROR_CALL, error));
            }
            else {
                this.resolve(util_2.transformResponse(Vals));
            }
        }
        catch (e) {
            this.reject(WormholeRequest.createError(ERRORS.ERROR_PARSING_RESPONSE));
        }
    };
    WormholeRequest.prototype.onConnectionError = function () {
        this.reject(WormholeRequest.createError(ERRORS.ERROR_CONNECTION));
        this.onDone();
    };
    WormholeRequest.prototype.callCallback = function (data) {
        var _this = this;
        var callback = this.callbacks.get(data.Ref);
        if (!callback) {
            return;
        }
        var args = data.Vars.reduce(function (res, part) { return res.concat(part.slice(1)); }, []);
        var payload = {
            Call: data.ID,
            Meta: null,
            Result: { Vals: [], Error: "" },
        };
        // @ts-ignore
        Promise.resolve(callback.apply(void 0, args))
            .then(function (result) { return _this.transformRequest(result); })
            .then(function (result) {
            payload.Result.Vals = result;
        })
            .catch(function (error) {
            payload.Result.Error = String(error);
        })
            .finally(function () {
            _this.sendMessage(WORMHOLE_TYPE_RESULT, payload);
        });
    };
    WormholeRequest.prototype.transformRequest = function (request) {
        var _a = util_2.transformRequest(request), payload = _a.payload, callbacks = _a.callbacks;
        for (var key in callbacks) {
            if (callbacks.hasOwnProperty(key)) {
                this.callbacks.set(key, callbacks[key]);
            }
        }
        return payload;
    };
    WormholeRequest.prototype.onDone = function () {
        this.connection.off("message", this._onConnectionMessage);
        this.connection.off("error", this._onConnectionError);
    };
    WormholeRequest.prototype.createPromise = function () {
        var _this = this;
        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    };
    return WormholeRequest;
}());
exports.default = WormholeRequest;
//# sourceMappingURL=Request.js.map