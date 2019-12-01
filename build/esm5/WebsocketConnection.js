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
var defaultOptions = {
    maxReconnects: Infinity,
    reconnect: true,
    reconnectTimeout: 10,
};
var WebsocketConnection = /** @class */ (function (_super) {
    __extends(WebsocketConnection, _super);
    function WebsocketConnection(connectionUrl, options) {
        var _this = _super.call(this) || this;
        _this.socket = null;
        _this.queue = [];
        _this.reconnects = 0;
        _this.freeze = false;
        _this.options = Object.assign({}, defaultOptions, options || {});
        _this.connectionUrl = connectionUrl;
        return _this;
    }
    WebsocketConnection.prototype.connect = function () {
        this.freeze = false;
        this.reconnects = 0;
        this.queue = [];
        this.tryConnect();
        return this;
    };
    WebsocketConnection.prototype.tryConnect = function () {
        var _this = this;
        try {
            var socket_1 = new WebSocket(this.connectionUrl);
            socket_1.onopen = function () { return _this.onOpen(socket_1); };
            socket_1.onclose = function (e) { return _this.onClose(e); };
            socket_1.onerror = function () { return _this.onError(); };
            socket_1.onmessage = function (e) { return _this.onMessage(e); };
        }
        catch (e) {
            this.emit("error", e);
        }
        return this;
    };
    WebsocketConnection.prototype.disconnect = function () {
        if (this.socket) {
            this.socket.close();
        }
    };
    WebsocketConnection.prototype.send = function (message) {
        this.queue.push(message);
        this.drain();
    };
    WebsocketConnection.prototype.reconnect = function () {
        var _this = this;
        var canReconnect = this.socket === null;
        if (canReconnect) {
            clearTimeout(this.reconnection);
            this.reconnection = setTimeout(function () {
                _this.reconnects++;
                _this.reconnection = null;
                _this.tryConnect();
            }, this.options.reconnectTimeout);
        }
    };
    WebsocketConnection.prototype.drain = function () {
        var _this = this;
        if (this.socket) {
            this.queue.forEach(function (msg) { return _this.socket.send(msg); });
            this.queue = [];
        }
    };
    WebsocketConnection.prototype.onOpen = function (socket) {
        this.reconnects = 0;
        this.socket = socket;
        this.drain();
        this.emit("connect");
    };
    WebsocketConnection.prototype.onClose = function (event) {
        this.socket = null;
        this.emit("disconnect", event);
        if (!event.wasClean) {
            this.tryReconnect();
        }
    };
    WebsocketConnection.prototype.onError = function () {
        this.socket = null;
        this.tryReconnect();
    };
    WebsocketConnection.prototype.onMessage = function (event) {
        this.emit("message", event);
    };
    WebsocketConnection.prototype.tryReconnect = function () {
        if (this.reconnects < this.options.maxReconnects) {
            this.reconnect();
        }
        else if (this.reconnects === this.options.maxReconnects && !this.freeze) {
            this.freeze = true;
            this.emit("error", new Error("UsedAttemptsReconnect"));
        }
    };
    return WebsocketConnection;
}(events_1.EventEmitter));
exports.default = WebsocketConnection;
//# sourceMappingURL=WebsocketConnection.js.map