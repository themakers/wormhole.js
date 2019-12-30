export interface IWebsocketConnectionOptions {
  maxConnectionTimeout: number;
  reconnect: boolean;
  maxReconnects: number;
  reconnectTimeout: number;
  websocketOptions: any;
}

export interface IWormholeClientOptions {
  connectionOptions: IWebsocketConnectionOptions;
}

export interface ICallbacks {
  [key: string]: () => void;
}
