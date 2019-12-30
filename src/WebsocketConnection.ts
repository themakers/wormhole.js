import {EventEmitter} from "events";
import {IWebsocketConnectionOptions} from "./types";

const DEFAULT_OPTIONS = {
  maxConnectionTimeout: 10,
  maxReconnects: Infinity,
  reconnect: true,
  reconnectTimeout: 2,
  websocketOptions: {},
};

export default class WebsocketConnection extends EventEmitter {
  private readonly options: IWebsocketConnectionOptions;
  private readonly url: string;
  private disconnected: boolean = false;
  private reconnects: number = 0;
  private socket: WebSocket = null;
  private awaitConnection: Promise<void> = null;
  private queue: any[] = [];

  constructor(url: string, options?: IWebsocketConnectionOptions) {
    super();
    this.url = url;
    this.options = Object.assign({}, DEFAULT_OPTIONS, options) as IWebsocketConnectionOptions;
  }

  public connect() {
    if (this.awaitConnection) {
      return this.awaitConnection;
    }

    this.reconnects = 0;
    this.disconnected = false;
    return this.awaitConnection = this.establishConnection();
  }

  public disconnect() {
    this.disconnected = true;
    if (this.socket) {
      this.socket.close();
    }
  }

  public send(message) {
    this.queue.push(message);
    this.drain();
  }

  private async establishConnection(): Promise<void> {
    const {maxReconnects, reconnectTimeout} = this.options;

    if (maxReconnects <= this.reconnects) {
      throw new Error("UsedAttemptsReconnect");
    }

    try {
      const socket = await this.connectWebsocket();
      this.onEstablishConnection(socket);
    } catch (e) {
      this.reconnects++;
      await sleepAsync(reconnectTimeout * 1000);
      return this.establishConnection();
    }
  }

  private async connectWebsocket(): Promise<WebSocket> {
    const {reconnectTimeout} = this.options;

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.applySocketOptions(socket);
      socket.onopen = () => resolve(socket);
      socket.onerror = socket.onclose = () => reject();
    });
  }

  private applySocketOptions(socket: WebSocket) {
    Object.entries(this.options.websocketOptions)
      .forEach(([key, value]) => {
        socket[key] = value;
      });
  }

  private onEstablishConnection(socket: WebSocket) {
    this.socket = socket;
    socket.onclose = () => this.onSocketClose();
    socket.onerror = () => this.onSocketError();
    socket.onmessage = (e: MessageEvent) => this.onSocketMessage(e);
    this.drain();
    this.emit("connect");
  }

  private onSocketMessage(event: MessageEvent) {
    this.emit("message", event.data);
  }

  private drain() {
    if (!this.socket) {
      return;
    }
    this.queue.forEach((msg) => this.socket.send(msg));
    this.queue.length = 0;
  }

  private onDisconnect() {
    this.emit("disconnect");

    if (!this.disconnected) {
      this.establishConnection()
        .catch((e) => this.emit("error", e));
    }
  }

  private onSocketClose() {
    this.onDisconnect();
  }

  private onSocketError() {
    this.onDisconnect();
  }
}

const sleepAsync = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
