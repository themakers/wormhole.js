/// <reference types="node" />
import { EventEmitter } from "events";
import { IWebsocketConnectionOptions } from "./types";
export default class WebsocketConnection extends EventEmitter {
    private readonly options;
    private readonly url;
    private disconnected;
    private reconnects;
    private socket;
    private awaitConnection;
    private queue;
    constructor(url: string, options?: IWebsocketConnectionOptions);
    connect(): Promise<void>;
    disconnect(): void;
    send(message: any): void;
    private establishConnection;
    private connectWebsocket;
    private applySocketOptions;
    private onEstablishConnection;
    private onSocketMessage;
    private drain;
    private onDisconnect;
    private onSocketClose;
    private onSocketError;
}
