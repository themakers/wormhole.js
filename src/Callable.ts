import EventEmitter from "events";
import {ICallbacks} from "./types";

export default class Callable extends EventEmitter {
  private callbacks: Map<string, () => any> = new Map();

  public addCallbacks(callbacks: ICallbacks) {
    Object.entries(callbacks).forEach(([key, callback]) => {
      this.callbacks.set(key, callback);
    });
    return this;
  }

  public hasCallback(key: string) {
    return this.callbacks.has(key);
  }

  public executeCallback(key: string, args: any) {
    return Promise.resolve().then(() => {
      const callback = this.callbacks.get(key);
      if (!callback) {
        throw new ReferenceError(`Callback ${key} is undefined`);
      }
      // @ts-ignore
      return callback(...args);
    });
  }
}
