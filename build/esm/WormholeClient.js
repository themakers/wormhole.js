import { EventEmitter } from "events";
import Request from "./Request";
import { transformRequest, transformResponse } from "./util";
import WebsocketConnection from "./WebsocketConnection";
const WORMHOLE_TYPE_CALL = "call";
const WORMHOLE_TYPE_RESULT = "result";
export default class WormholeClient extends EventEmitter {
    constructor(connectionUrl, options) {
        super();
        this.options = {};
        this.provides = {};
        // tslint:disable-next-line:variable-name
        this._onConnectionMessage = this.onConnectionMessage.bind(this);
        if (!connectionUrl) {
            throw new Error("connectionUrl required");
        }
        this.options = options;
        this.connection = new WebsocketConnection(connectionUrl, this.options.connectionOptions);
        this.connection.on("message", this._onConnectionMessage);
    }
    connect() {
        return this.connection.connect();
    }
    getConnection() {
        return this.connection;
    }
    disconnect() {
        this.connection.disconnect();
        return this;
    }
    get remote() {
        return this.getRemoteProxy();
    }
    provide(module, methods) {
        Object.assign(this.provides, mapProvide(module, methods));
        return this;
    }
    getRemoteProxy() {
        const self = this;
        const path = [];
        function call(request, metadata) {
            return self.createRequest(path.join("."), request, metadata);
        }
        const handler = {
            get(_, part) {
                if (!part.startsWith("Symbol")) {
                    path.push(part);
                }
                return proxy;
            },
        };
        const proxy = new Proxy(call, handler);
        return proxy;
    }
    createRequest(path, request, metadata) {
        return new Request(path, request, metadata, this.connection);
    }
    onConnectionMessage(event) {
        try {
            const data = JSON.parse(event.data);
            if (data.Type === WORMHOLE_TYPE_CALL) {
                this.callProvideMethod(data.Payload);
            }
        }
        catch (e) {
            // Do nothing
        }
    }
    callProvideMethod(data) {
        const key = data.Ref;
        if (!this.provides[key]) {
            return;
        }
        const args = transformResponse(data.Vars);
        const payload = {
            Call: data.ID,
            Meta: null,
            Result: { Vals: [], Error: "" },
        };
        // @ts-ignore
        Promise.resolve(this.provides[key](...args))
            .then((result) => transformRequest(result))
            .then((result) => {
            // @ts-ignore
            payload.Result.Vals = result.payload;
        })
            .catch((error) => {
            payload.Result.Error = String(error);
        })
            .finally(() => {
            this.sendMessage(WORMHOLE_TYPE_RESULT, payload);
        });
    }
    sendMessage(type, payload) {
        const message = { Payload: payload, Type: type };
        this.connection.send(JSON.stringify(message));
    }
}
const mapProvide = (module, methods) => {
    const result = {};
    for (const method in methods) {
        if (methods.hasOwnProperty(method)) {
            result[`${module}.${method}`] = methods[method];
        }
    }
    return result;
};
//# sourceMappingURL=WormholeClient.js.map