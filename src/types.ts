export interface IWebsocketConnectionOptions {
    reconnect: boolean;
    maxReconnects: number;
    reconnectTimeout: number;
}

export interface IWormholeClientOptions {
    connectionOptions: IWebsocketConnectionOptions;
}

export interface IWormholeRequest {
    [key: string]: any;
}

export interface IWormholeMetadata {
    [key: string]: string;
}
