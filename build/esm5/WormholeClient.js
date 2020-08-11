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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var msgpack = __importStar(require("@msgpack/msgpack"));
var Call_1 = __importDefault(require("./Call"));
var Callable_1 = __importDefault(require("./Callable"));
var constraints_1 = require("./constraints");
var Messages_1 = require("./Messages");
var util_1 = require("./util");
var WebsocketConnection_1 = __importDefault(require("./WebsocketConnection"));
var WormholeClient = /** @class */ (function (_super) {
    __extends(WormholeClient, _super);
    function WormholeClient(url, options) {
        var _this = _super.call(this) || this;
        _this.calls = [];
        _this.options = options || {};
        var connectionOptions = _this.options.connectionOptions || {};
        connectionOptions.websocketOptions = Object.assign(connectionOptions.websocketOptions || {}, { binaryType: "arraybuffer" });
        _this.connection = new WebsocketConnection_1.default(url, connectionOptions);
        _this.connection.on("message", function (message) { return _this.onConnectionMessage(message); });
        return _this;
    }
    WormholeClient.prototype.connect = function () {
        return this.connection.connect();
    };
    WormholeClient.prototype.disconnect = function () {
        return this.connection.disconnect();
    };
    WormholeClient.prototype.provide = function (service, methods) {
        this.addCallbacks(util_1.mapProvide(service, methods));
    };
    WormholeClient.prototype.call = function (part) {
        var _this = this;
        var parts = [part];
        var call = function (message) {
            return _this.send(parts.join("."), message);
        };
        var proxy = new Proxy(call, {
            get: function (target, p) {
                parts.push(p);
                return proxy;
            },
        });
        return proxy;
    };
    WormholeClient.prototype.onConnectionMessage = function (message) {
        try {
            this.onReceiveMessage(msgpack.decode(new Uint8Array(message)));
        }
        catch (e) {
            // Do nothing
        }
    };
    WormholeClient.prototype.send = function (ref, message) {
        var call = new Call_1.default(ref, message);
        this.calls.push(call);
        this.sendMessage(call.request());
        return call.promise();
    };
    WormholeClient.prototype.sendMessage = function (message) {
        var buffer = msgpack.encode(message);
        this.connection.send(buffer);
    };
    WormholeClient.prototype.onReceiveMessage = function (message) {
        var type = message[1];
        if (type === constraints_1.WORMHOLE_TYPE_CALL) {
            this.onReceiveCall(message);
        }
        else {
            this.onReceiveResult(message);
        }
    };
    WormholeClient.prototype.onReceiveCall = function (msg) {
        var _this = this;
        var message = new Messages_1.CallMessage().decode(msg);
        var call = this.calls.find(function (c) { return c.hasAcceptMessage(message.ref); });
        var parent = call || this;
        parent.executeCallback(message.ref, message.payload).then(function (result) { return [result, null]; })
            .catch(function (e) { return [null, e]; })
            .then(function (payload) { return new Messages_1.ResultMessage({ id: message.id, ref: message.ref, payload: payload }).encode(); })
            .then(function (data) { return _this.sendMessage(data); });
    };
    WormholeClient.prototype.onReceiveResult = function (msg) {
        var message = new Messages_1.ResultMessage().decode(msg);
        var call = this.calls.find(function (c) { return c.hasAcceptMessage(message.id); });
        if (call) {
            call.receiveResult(message);
            this.onDoneCall(call);
        }
    };
    WormholeClient.prototype.onDoneCall = function (call) {
        this.calls = this.calls.filter(function (c) { return c !== call; });
    };
    WormholeClient.prototype.onDisconnect = function () {
        this.emit("disconnect");
    };
    WormholeClient.prototype.onConnectionError = function (e) {
        this.emit("error", e);
    };
    return WormholeClient;
}(Callable_1.default));
exports.default = (function (url, options) {
    var client = new WormholeClient(url, options);
    return new Proxy(client, {
        get: function (target, path) {
            if (isUpperCaseFirstLetter(path)) {
                return client.call(path);
            }
            else {
                return client[path];
            }
        },
    });
});
var isUpperCaseFirstLetter = function (val) {
    var stringVal = String(val);
    return stringVal[0].toUpperCase() === stringVal[0];
};
//# sourceMappingURL=WormholeClient.js.map