import { EventEmitter } from "events";
const defaultOptions = {
    maxReconnects: Infinity,
    reconnect: true,
    reconnectTimeout: 10,
};
export default class WebsocketConnection extends EventEmitter {
    constructor(connectionUrl, options) {
        super();
        this.socket = null;
        this.queue = [];
        this.reconnects = 0;
        this.freeze = false;
        this.options = Object.assign({}, defaultOptions, options);
        this.connectionUrl = connectionUrl;
    }
    connect() {
        this.freeze = false;
        this.reconnects = 0;
        this.queue = [];
        this.tryConnect();
        return this;
    }
    tryConnect() {
        try {
            const socket = new WebSocket(this.connectionUrl);
            socket.onopen = () => this.onOpen(socket);
            socket.onclose = (e) => this.onClose(e);
            socket.onerror = () => this.onError();
            socket.onmessage = (e) => this.onMessage(e);
        }
        catch (e) {
            this.emit("error", e);
        }
        return this;
    }
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
    send(message) {
        this.queue.push(message);
        this.drain();
    }
    reconnect() {
        const canReconnect = this.socket === null;
        if (canReconnect) {
            clearTimeout(this.reconnection);
            this.reconnection = setTimeout(() => {
                this.reconnects++;
                this.reconnection = null;
                this.tryConnect();
            }, this.options.reconnectTimeout);
        }
    }
    drain() {
        if (this.socket) {
            this.queue.forEach((msg) => this.socket.send(msg));
            this.queue = [];
        }
    }
    onOpen(socket) {
        this.reconnects = 0;
        this.socket = socket;
        this.drain();
        this.emit("connect");
    }
    onClose(event) {
        this.socket = null;
        this.emit("disconnect", event);
        if (!event.wasClean) {
            this.tryReconnect();
        }
    }
    onError() {
        this.socket = null;
        this.tryReconnect();
    }
    onMessage(event) {
        this.emit("message", event);
    }
    tryReconnect() {
        if (this.reconnects < this.options.maxReconnects) {
            this.reconnect();
        }
        else if (this.reconnects === this.options.maxReconnects && !this.freeze) {
            this.freeze = true;
            this.emit("error", new Error("UsedAttemptsReconnect"));
        }
    }
}
//# sourceMappingURL=WebsocketConnection.js.map