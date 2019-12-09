"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var Request_1 = require("./Request");
var util_1 = require("./util");
var WebsocketConnection_1 = require("./WebsocketConnection");
var WORMHOLE_TYPE_CALL = "call";
var WORMHOLE_TYPE_RESULT = "result";
var WormholeClient = /** @class */ (function (_super) {
    __extends(WormholeClient, _super);
    function WormholeClient(connectionUrl, options) {
        var _this = _super.call(this) || this;
        _this.options = {};
        _this.provides = {};
        // tslint:disable-next-line:variable-name
        _this._onConnectionMessage = _this.onConnectionMessage.bind(_this);
        if (!connectionUrl) {
            throw new Error("connectionUrl required");
        }
        _this.options = options || {};
        _this.connection = new WebsocketConnection_1.default(connectionUrl, _this.options.connectionOptions);
        _this.connection.on("message", _this._onConnectionMessage);
        return _this;
    }
    WormholeClient.prototype.connect = function () {
        return this.connection.connect();
    };
    WormholeClient.prototype.getConnection = function () {
        return this.connection;
    };
    WormholeClient.prototype.disconnect = function () {
        this.connection.disconnect();
        return this;
    };
    Object.defineProperty(WormholeClient.prototype, "remote", {
        get: function () {
            return this.getRemoteProxy();
        },
        enumerable: true,
        configurable: true
    });
    WormholeClient.prototype.provide = function (module, methods) {
        Object.assign(this.provides, mapProvide(module, methods));
        return this;
    };
    WormholeClient.prototype.createRequest = function (path, request) {
        return new Request_1.default(path, request, this.connection);
    };
    WormholeClient.prototype.onConnectionMessage = function (event) {
        try {
            var data = JSON.parse(event.data);
            if (data.Type === WORMHOLE_TYPE_CALL) {
                this.callProvideMethod(data.Payload);
            }
        }
        catch (e) {
            // Do nothing
        }
    };
    WormholeClient.prototype.getRemoteProxy = function () {
        var self = this;
        var path = [];
        function call(request) {
            return self.createRequest(path.join("."), request);
        }
        var handler = {
            get: function (_, part) {
                if (!part.startsWith("Symbol")) {
                    path.push(part);
                }
                return proxy;
            },
        };
        var proxy = new Proxy(call, handler);
        return proxy;
    };
    WormholeClient.prototype.callProvideMethod = function (data) {
        var _a;
        var _this = this;
        var key = data.Ref;
        if (!this.provides[key]) {
            return;
        }
        var args = util_1.transformResponse(data.Vars);
        var payload = {
            Call: data.ID,
            Meta: null,
            Result: { Vals: [], Error: "" },
        };
        // @ts-ignore
        Promise.resolve((_a = this.provides)[key].apply(_a, args))
            .then(function (result) { return util_1.transformRequest(result); })
            .then(function (result) {
            // @ts-ignore
            payload.Result.Vals = result.payload;
        })
            .catch(function (error) {
            payload.Result.Error = String(error);
        })
            .finally(function () {
            _this.sendMessage(WORMHOLE_TYPE_RESULT, payload);
        });
    };
    WormholeClient.prototype.sendMessage = function (type, payload) {
        var message = { Payload: payload, Type: type };
        this.connection.send(JSON.stringify(message));
    };
    return WormholeClient;
}(events_1.EventEmitter));
function default_1() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    // @ts-ignore
    var client = new (WormholeClient.bind.apply(WormholeClient, __spreadArrays([void 0], args)))();
    return new Proxy({}, {
        get: function (_, part) {
            var firstLetter = part[0];
            if (firstLetter === firstLetter.toUpperCase()) {
                return client.remote;
            }
            return client[part];
        },
    });
}
exports.default = default_1;
var mapProvide = function (module, methods) {
    var result = {};
    for (var method in methods) {
        if (methods.hasOwnProperty(method)) {
            result[module + "." + method] = methods[method];
        }
    }
    return result;
};
//# sourceMappingURL=WormholeClient.js.map