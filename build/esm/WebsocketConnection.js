var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventEmitter } from "events";
const DEFAULT_OPTIONS = {
    maxConnectionTimeout: 10,
    maxReconnects: Infinity,
    reconnect: true,
    reconnectTimeout: 2,
    websocketOptions: {},
};
export default class WebsocketConnection extends EventEmitter {
    constructor(url, options) {
        super();
        this.disconnected = false;
        this.reconnects = 0;
        this.socket = null;
        this.awaitConnection = null;
        this.queue = [];
        this.url = url;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    }
    connect() {
        if (this.awaitConnection) {
            return this.awaitConnection;
        }
        this.reconnects = 0;
        this.disconnected = false;
        return this.awaitConnection = this.establishConnection();
    }
    disconnect() {
        this.disconnected = true;
        if (this.socket) {
            this.socket.close();
        }
    }
    send(message) {
        this.queue.push(message);
        this.drain();
    }
    establishConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const { maxReconnects, reconnectTimeout } = this.options;
            if (maxReconnects <= this.reconnects) {
                throw new Error("UsedAttemptsReconnect");
            }
            try {
                const socket = yield this.connectWebsocket();
                this.onEstablishConnection(socket);
            }
            catch (e) {
                this.reconnects++;
                yield sleep(reconnectTimeout * 1000);
                return this.establishConnection();
            }
        });
    }
    connectWebsocket() {
        return __awaiter(this, void 0, void 0, function* () {
            const { reconnectTimeout } = this.options;
            return new Promise((resolve, reject) => {
                const socket = new WebSocket(this.url);
                this.applySocketOptions(socket);
                socket.onopen = () => resolve(socket);
                socket.onerror = socket.onclose = () => reject();
            });
        });
    }
    applySocketOptions(socket) {
        Object.entries(this.options.websocketOptions)
            .forEach(([key, value]) => {
            socket[key] = value;
        });
    }
    onEstablishConnection(socket) {
        this.socket = socket;
        socket.onclose = () => this.onSocketClose();
        socket.onerror = () => this.onSocketError();
        socket.onmessage = (e) => this.onSocketMessage(e);
        this.drain();
        this.emit("connect");
    }
    onSocketMessage(event) {
        this.emit("message", event.data);
    }
    drain() {
        if (!this.socket) {
            return;
        }
        this.queue.forEach((msg) => this.socket.send(msg));
        this.queue.length = 0;
    }
    onDisconnect() {
        this.emit("disconnect");
        if (!this.disconnected) {
            this.establishConnection()
                .catch((e) => this.emit("error", e));
        }
    }
    onSocketClose() {
        this.onDisconnect();
    }
    onSocketError() {
        this.onDisconnect();
    }
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//# sourceMappingURL=WebsocketConnection.js.map