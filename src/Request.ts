import {uuid} from "./util";
import {transformRequest, transformResponse} from "./util";
import WebsocketConnection from "./WebsocketConnection";

const WORMHOLE_TYPE_CALL = "call";
const WORMHOLE_TYPE_RESULT = "result";

enum ERRORS {
    ERROR_PARSING_MESSAGE = 1,
    ERROR_CONNECTION,
    ERROR_CALL,
    ERROR_PARSING_RESPONSE,
}

export default class WormholeRequest {
    private static createError(type: number, data?: any) {
        const error = new Error(String(data) || ERRORS[type]);
        error.name = ERRORS[type];
        return error;
    }

    private promise: Promise<any>;
    private resolve: (result: any) => any;
    private reject: (error: any) => any;
    private readonly path: string;
    private readonly request: any;
    private connection: WebsocketConnection;
    private callbacks: Map<string, () => any> = new Map<string, () => any>();
    private id: string = uuid();
    // tslint:disable-next-line:variable-name
    private _onConnectionMessage = this.onConnectionMessage.bind(this);
    // tslint:disable-next-line:variable-name
    private _onConnectionError = this.onConnectionError.bind(this);

    constructor(
        path: string,
        request: any = [],
        connection: WebsocketConnection,
    ) {
        this.createPromise();
        this.path = path;
        this.request = this.transformRequest(request);
        this.connection = connection;
        this.connection.on("message", this._onConnectionMessage);
        this.connection.on("error", this._onConnectionError);
        this.send();
    }

    public then(onFulfilled: () => any, onRejected: any): Promise<any> {
        return this.promise.then(onFulfilled, onRejected);
    }

    public catch(onRejected: () => any): Promise<any> {
        return this.promise.catch(onRejected);
    }

    public finally(onFinally: () => any): Promise<any> {
        return this.promise.finally(onFinally);
    }

    private send() {
        this.sendMessage(WORMHOLE_TYPE_CALL, {ID: this.id, Ref: this.path, Vars: this.request});
    }

    private sendMessage(type: string, payload: any) {
        const message = {Payload: payload, Type: type};
        this.connection.send(JSON.stringify(message));
    }

    private onConnectionMessage(event: MessageEvent) {
        try {
            const data = JSON.parse(event.data);
            this.receiveMessage(data);
        } catch (e) {
            this.reject(WormholeRequest.createError(ERRORS.ERROR_PARSING_MESSAGE));
            this.onDone();
        }
    }

    private receiveMessage(message: any) {
        if (message.Type === WORMHOLE_TYPE_CALL) {
            this.callCallback(message.Payload);
        } else if (message.Type === WORMHOLE_TYPE_RESULT) {
            this.onResult(message.Payload);
        }
    }

    private onResult(data) {
        const error = data.Result.Error;
        const Vals = data.Result.Vals;

        try {
            if (error) {
                this.reject(WormholeRequest.createError(ERRORS.ERROR_CALL, error));
            } else {
                this.resolve(transformResponse(Vals));
            }
        } catch (e) {
            this.reject(WormholeRequest.createError(ERRORS.ERROR_PARSING_RESPONSE));
        }
    }

    private onConnectionError() {
        this.reject(WormholeRequest.createError(ERRORS.ERROR_CONNECTION));
        this.onDone();
    }

    private callCallback(data: any) {
        const callback = this.callbacks.get(data.Ref);
        if (!callback) {
            return;
        }

        const args: any[] = data.Vars.reduce((res: any, part: any) => res.concat(part.slice(1)), []);
        const payload = {
            Call: data.ID,
            Meta: null,
            Result: {Vals: [], Error: ""},
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

    private transformRequest(request: any) {
        const {payload, callbacks} = transformRequest(request);

        for (const key in callbacks) {
            if (callbacks.hasOwnProperty(key)) {
                this.callbacks.set(key, callbacks[key]);
            }
        }

        return payload;
    }

    private onDone() {
        this.connection.off("message", this._onConnectionMessage);
        this.connection.off("error", this._onConnectionError);
    }

    private createPromise(): void {
        this.promise = new Promise<any>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
