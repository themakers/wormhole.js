import * as msgpack from "@msgpack/msgpack";
import Call from "./Call";
import Callable from "./Callable";
import {WORMHOLE_TYPE_CALL} from "./constraints";
import {CallMessage, ResultMessage} from "./Messages";
import {IWebsocketConnectionOptions, IWormholeClientOptions} from "./types";
import {mapProvide} from "./util";
import WebsocketConnection from "./WebsocketConnection";

class WormholeClient extends Callable {
  private options: IWormholeClientOptions;
  private connection: WebsocketConnection;
  private calls: Call[] = [];

  constructor(url: string, options?: IWormholeClientOptions) {
    super();
    this.options = options || {} as IWormholeClientOptions;
    const connectionOptions = this.options.connectionOptions || {} as IWebsocketConnectionOptions;
    connectionOptions.websocketOptions = Object.assign(connectionOptions.websocketOptions || {}, {binaryType: "arraybuffer"}) as IWebsocketConnectionOptions;
    this.connection = new WebsocketConnection(url, connectionOptions);
    this.connection.on("message", (message) => this.onConnectionMessage(message));
  }

  public connect() {
    return this.connection.connect();
  }

  public disconnect() {
    return this.connection.disconnect();
  }

  public provide(service: string, methods: any) {
    this.addCallbacks(mapProvide(service, methods));
  }

  public call(part: string | number | symbol) {
    const parts = [part];

    const call = (message: any) => {
      return this.send(parts.join("."), message);
    };

    const proxy = new Proxy(call, {
      get(target: any, p: string | number | symbol): any {
        parts.push(p);
        return proxy;
      },
    });

    return proxy;
  }

  private onConnectionMessage(message) {
    try {
      this.onReceiveMessage(msgpack.decode(new Uint8Array(message)));
    } catch (e) {
      // Do nothing
    }
  }

  private send(ref: string, message: any) {
    const call = new Call(ref, message);
    this.calls.push(call);
    this.sendMessage(call.request());
    return call.promise();
  }

  private sendMessage(message: any) {
    const buffer = msgpack.encode(message);
    this.connection.send(buffer);
  }

  private onReceiveMessage(message) {
    const type = message[1];

    if (type === WORMHOLE_TYPE_CALL) {
      this.onReceiveCall(message);
    } else {
      this.onReceiveResult(message);
    }
  }

  private onReceiveCall(msg) {
    const message = new CallMessage().decode(msg);
    const call = this.calls.find((c: Call) => c.hasAcceptMessage(message.ref));
    const parent = call || this;

    parent.executeCallback(message.ref, message.payload).then((result) => [result, null])
      .catch((e) => [null, e])
      .then((payload) => new ResultMessage({id: message.id, ref: message.ref, payload}).encode())
      .then((data) => this.sendMessage(data));
  }

  private onReceiveResult(msg) {
    const message = new ResultMessage().decode(msg);
    const call = this.calls.find((c: Call) => c.hasAcceptMessage(message.id));
    if (call) {
      call.receiveResult(message);
      this.onDoneCall(call);
    }
  }

  private onDoneCall(call) {
    this.calls = this.calls.filter((c) => c !== call);
  }

  private onDisconnect() {
    this.emit("disconnect");
  }

  private onConnectionError(e) {
    this.emit("error", e);
  }
}

export default (url: string, options?: IWormholeClientOptions) => {
  const client = new WormholeClient(url, options);

  return new Proxy(client, {
    get(target: WormholeClient, path: string | number | symbol): any {
      if (isUpperCaseFirstLetter(path)) {
        return client.call(path);
      } else {
        return client[path];
      }
    },
  });
};

const isUpperCaseFirstLetter = (val) => {
  const stringVal = String(val);
  return stringVal[0].toUpperCase() === stringVal[0];
};
