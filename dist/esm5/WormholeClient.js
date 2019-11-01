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
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var Request_1 = require("./Request");
var WebsocketConnection_1 = require("./WebsocketConnection");
var WormholeClient = /** @class */ (function (_super) {
    __extends(WormholeClient, _super);
    function WormholeClient(connectionUrl, options) {
        var _this = _super.call(this) || this;
        _this.options = {};
        if (!connectionUrl) {
            throw new Error("connectionUrl required");
        }
        _this.options = options;
        _this.connection = new WebsocketConnection_1.default(connectionUrl, _this.options.connectionOptions);
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
            return this.getMethodsProxy();
        },
        enumerable: true,
        configurable: true
    });
    WormholeClient.prototype.getMethodsProxy = function () {
        var self = this;
        var path = [];
        function call(request, metadata) {
            return self.createRequest(path.join("."), request, metadata);
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
    WormholeClient.prototype.createRequest = function (path, request, metadata) {
        return new Request_1.default(path, request, metadata, this.connection);
    };
    return WormholeClient;
}(events_1.EventEmitter));
exports.default = WormholeClient;
//# sourceMappingURL=WormholeClient.js.map