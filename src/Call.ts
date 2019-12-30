import * as Adapters from "./Adapters";
import Callable from "./Callable";
import {CallMessage} from "./Messages";
import {uuid} from "./util";

// @ts-ignore
export default class WormholeCall extends Callable {
  private payload: any[] = [];
  private ref: string;
  private reject: (reason?: any) => void;
  private resolve: (value?: (PromiseLike<any> | any)) => void;
  private id: string = uuid();

  constructor(ref: string, ...payloads) {
    super();
    this.ref = ref;

    payloads.forEach((data) => {
      const {payload, callbacks} = Adapters.Request(data);
      this.addCallbacks(callbacks);
      this.payload.push(payload);
    });
  }

  public request() {
    return new CallMessage({id: this.id, ref: this.ref, payload: this.payload}).encode();
  }

  public promise(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  public hasAcceptMessage(id: string) {
    return this.id === id || this.hasCallback(id);
  }

  public receiveResult(message) {
    const [result, error] = message.payload;

    if (error !== null) {
      this.reject(error);
    } else {
      this.resolve(result);
    }

    this.emit("done");
  }
}
