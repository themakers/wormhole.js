import { IWormholeMetadata } from "./types";
import WebsocketConnection from "./WebsocketConnection";
export default class WormholeRequest {
    private static createError;
    private promise;
    private resolve;
    private reject;
    private readonly path;
    private readonly request;
    private readonly metadata;
    private connection;
    private callbacks;
    private id;
    private _onConnectionMessage;
    private _onConnectionError;
    constructor(path: string, request: any, metadata: IWormholeMetadata, connection: WebsocketConnection);
    then(onFulfilled: () => any, onRejected: any): Promise<any>;
    catch(onRejected: () => any): Promise<any>;
    finally(onFinally: () => any): Promise<any>;
    private send;
    private sendMessage;
    private onConnectionMessage;
    private receiveMessage;
    private onResult;
    private onConnectionError;
    private callCallback;
    private transformRequest;
    private onDone;
    private createPromise;
}
