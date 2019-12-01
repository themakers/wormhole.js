import {EventEmitter} from "events";
import {IWebsocketConnectionOptions} from "./types";

const defaultOptions: IWebsocketConnectionOptions = {
  maxReconnects: Infinity,
  reconnect: true,
  reconnectTimeout: 10,
};

export default class WebsocketConnection extends EventEmitter {
  private options: IWebsocketConnectionOptions;
  private connectionUrl: string;
  private socket: WebSocket = null;
  private queue: string[] = [];
  private reconnection: any;
  private reconnects: number = 0;
  private freeze: boolean = false;

  constructor(connectionUrl: string, options: IWebsocketConnectionOptions) {
    super();
    this.options = Object.assign({}, defaultOptions, options || {} as IWebsocketConnectionOptions);
    this.connectionUrl = connectionUrl;
  }

  public connect() {
    this.freeze = false;
    this.reconnects = 0;
    this.queue = [];
    this.tryConnect();
    return this;
  }

  public tryConnect() {
    try {
      const socket = new WebSocket(this.connectionUrl);
      socket.onopen = () => this.onOpen(socket);
      socket.onclose = (e) => this.onClose(e);
      socket.onerror = () => this.onError();
      socket.onmessage = (e) => this.onMessage(e);
    } catch (e) {
      this.emit("error", e);
    }
    return this;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }

  public send(message) {
    this.queue.push(message);
    this.drain();
  }

  public reconnect() {
    const canReconnect = this.socket === null;
    if (canReconnect) {
      clearTimeout(this.reconnection);
      this.reconnection = setTimeout(() => {
        this.reconnects++;
        this.reconnection = null;
        this.tryConnect();
      }, this.options.reconnectTimeout);
    }
  }

  private drain() {
    if (this.socket) {
      this.queue.forEach((msg) => this.socket.send(msg));
      this.queue = [];
    }
  }

  private onOpen(socket) {
    this.reconnects = 0;
    this.socket = socket;
    this.drain();
    this.emit("connect");
  }

  private onClose(event: CloseEvent) {
    this.socket = null;
    this.emit("disconnect", event);
    if (!event.wasClean) {
      this.tryReconnect();
    }
  }

  private onError() {
    this.socket = null;
    this.tryReconnect();
  }

  private onMessage(event: MessageEvent) {
    this.emit("message", event);
  }

  private tryReconnect() {
    if (this.reconnects < this.options.maxReconnects) {
      this.reconnect();
    } else if (this.reconnects === this.options.maxReconnects && !this.freeze) {
      this.freeze = true;
      this.emit("error", new Error("UsedAttemptsReconnect"));
    }
  }
}
