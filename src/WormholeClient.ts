import {EventEmitter} from "events";
import Request from "./Request";
import {IWormholeClientOptions, IWormholeRequest} from "./types";
import {transformRequest, transformResponse} from "./util";
import WebsocketConnection from "./WebsocketConnection";

const WORMHOLE_TYPE_CALL = "call";
const WORMHOLE_TYPE_RESULT = "result";

export default class WormholeClient extends EventEmitter {
  private options: IWormholeClientOptions = {} as IWormholeClientOptions;
  private readonly connection: WebsocketConnection;
  private provides: { [key: string]: any } = {};
  // tslint:disable-next-line:variable-name
  private _onConnectionMessage = this.onConnectionMessage.bind(this);

  constructor(connectionUrl: string, options: IWormholeClientOptions) {
    super();
    if (!connectionUrl) {
      throw new Error("connectionUrl required");
    }
    this.options = options || {} as IWormholeClientOptions;
    this.connection = new WebsocketConnection(connectionUrl, this.options.connectionOptions);
    this.connection.on("message", this._onConnectionMessage);
  }

  public connect(): WebsocketConnection {
    return this.connection.connect();
  }

  public getConnection(): WebsocketConnection {
    return this.connection;
  }

  public disconnect(): WormholeClient {
    this.connection.disconnect();
    return this;
  }

  public get remote() {
    return this.getRemoteProxy();
  }

  public provide(module, methods) {
    Object.assign(this.provides, mapProvide(module, methods));
    return this;
  }

  private getRemoteProxy() {
    const self = this;
    const path: string[] = [];

    function call(request: IWormholeRequest) {
      return self.createRequest(path.join("."), request);
    }

    const handler = {
      get(_, part: string) {
        if (!part.startsWith("Symbol")) {
          path.push(part);
        }
        return proxy;
      },
    };

    const proxy = new Proxy(call, handler);
    return proxy;
  }

  private createRequest(path: string, request: IWormholeRequest) {
    return new Request(path, request, this.connection);
  }

  private onConnectionMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      if (data.Type === WORMHOLE_TYPE_CALL) {
        this.callProvideMethod(data.Payload);
      }
    } catch (e) {
      // Do nothing
    }
  }

  private callProvideMethod(data: any) {
    const key = data.Ref;
    if (!this.provides[key]) {
      return;
    }

    const args = transformResponse(data.Vars);
    const payload = {
      Call: data.ID,
      Meta: null,
      Result: {Vals: [], Error: ""},
    };
    // @ts-ignore
    Promise.resolve(this.provides[key](...args))
      .then((result) => transformRequest(result))
      .then((result) => {
        // @ts-ignore
        payload.Result.Vals = result.payload;
      })
      .catch((error) => {
        payload.Result.Error = String(error);
      })
      .finally(() => {
        this.sendMessage(WORMHOLE_TYPE_RESULT, payload);
      });
  }

  private sendMessage(type: string, payload: any) {
    const message = {Payload: payload, Type: type};
    this.connection.send(JSON.stringify(message));
  }
}

const mapProvide = (module: string, methods: any) => {
  const result = {};
  for (const method in methods) {
    if (methods.hasOwnProperty(method)) {
      result[`${module}.${method}`] = methods[method];
    }
  }
  return result;
};
