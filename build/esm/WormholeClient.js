import * as msgpack from "@msgpack/msgpack";
import Call from "./Call";
import Callable from "./Callable";
import { WORMHOLE_TYPE_CALL } from "./constraints";
import { CallMessage, ResultMessage } from "./Messages";
import { mapProvide } from "./util";
import WebsocketConnection from "./WebsocketConnection";
class WormholeClient extends Callable {
    constructor(url, options) {
        super();
        this.calls = [];
        this.options = options || {};
        const connectionOptions = this.options.connectionOptions || {};
        connectionOptions.websocketOptions = Object.assign(connectionOptions.websocketOptions || {}, { binaryType: "arraybuffer" });
        this.connection = new WebsocketConnection(url, connectionOptions);
        this.connection.on("message", (message) => this.onConnectionMessage(message));
    }
    connect() {
        return this.connection.connect();
    }
    disconnect() {
        return this.connection.disconnect();
    }
    provide(service, methods) {
        this.addCallbacks(mapProvide(service, methods));
    }
    call(part) {
        const parts = [part];
        const call = (message) => {
            return this.send(parts.join("."), message);
        };
        const proxy = new Proxy(call, {
            get(target, p) {
                parts.push(p);
                return proxy;
            },
        });
        return proxy;
    }
    onConnectionMessage(message) {
        try {
            this.onReceiveMessage(msgpack.decode(new Uint8Array(message)));
        }
        catch (e) {
            // Do nothing
        }
    }
    send(ref, message) {
        const call = new Call(ref, message);
        this.calls.push(call);
        this.sendMessage(call.request());
        return call.promise();
    }
    sendMessage(message) {
        const buffer = msgpack.encode(message);
        this.connection.send(buffer);
    }
    onReceiveMessage(message) {
        const type = message[1];
        if (type === WORMHOLE_TYPE_CALL) {
            this.onReceiveCall(message);
        }
        else {
            this.onReceiveResult(message);
        }
    }
    onReceiveCall(msg) {
        const message = new CallMessage().decode(msg);
        const call = this.calls.find((c) => c.hasAcceptMessage(message.ref));
        const parent = call || this;
        parent.executeCallback(message.ref, message.payload).then((result) => [result, null])
            .catch((e) => [null, e])
            .then((payload) => new ResultMessage({ id: message.id, ref: message.ref, payload }).encode())
            .then((data) => this.sendMessage(data));
    }
    onReceiveResult(msg) {
        const message = new ResultMessage().decode(msg);
        const call = this.calls.find((c) => c.hasAcceptMessage(message.id));
        if (call) {
            call.receiveResult(message);
            this.onDoneCall(call);
        }
    }
    onDoneCall(call) {
        this.calls = this.calls.filter((c) => c !== call);
    }
    onDisconnect() {
        this.emit("disconnect");
    }
    onConnectionError(e) {
        this.emit("error", e);
    }
}
export default (url, options) => {
    const client = new WormholeClient(url, options);
    return new Proxy(client, {
        get(target, path) {
            if (isUpperCaseFirstLetter(path)) {
                return client.call(path);
            }
            else {
                return client[path];
            }
        },
    });
};
const isUpperCaseFirstLetter = (val) => {
    const stringVal = String(val);
    return stringVal[0].toUpperCase() === stringVal[0];
};
//# sourceMappingURL=WormholeClient.js.map