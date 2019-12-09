/// <reference types="node" />
import { EventEmitter } from "events";
import { IWebsocketConnectionOptions } from "./types";
export default class WebsocketConnection extends EventEmitter {
    private options;
    private connectionUrl;
    private socket;
    private queue;
    private reconnection;
    private reconnects;
    private freeze;
    private disconnectTimeout;
    constructor(connectionUrl: string, options: IWebsocketConnectionOptions);
    connect(): this;
    tryConnect(): this;
    disconnect(): void;
    send(message: any): void;
    reconnect(): void;
    private drain;
    private onOpen;
    private onClose;
    private onError;
    private onMessage;
    private tryReconnect;
}
