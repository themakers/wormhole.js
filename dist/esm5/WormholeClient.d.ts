/// <reference types="node" />
import { EventEmitter } from "events";
import { IWormholeClientOptions } from "./types";
import WebsocketConnection from "./WebsocketConnection";
export default class WormholeClient extends EventEmitter {
    private options;
    private readonly connection;
    private provides;
    private _onConnectionMessage;
    constructor(connectionUrl: string, options: IWormholeClientOptions);
    connect(): WebsocketConnection;
    getConnection(): WebsocketConnection;
    disconnect(): WormholeClient;
    readonly remote: any;
    provide(module: any, methods: any): this;
    private getRemoteProxy;
    private createRequest;
    private onConnectionMessage;
    private callProvideMethod;
    private sendMessage;
}
