/// <reference types="node" />
import EventEmitter from "events";
import { ICallbacks } from "./types";
export default class Callable extends EventEmitter {
    private callbacks;
    addCallbacks(callbacks: ICallbacks): this;
    hasCallback(key: string): boolean;
    executeCallback(key: string, args: any): Promise<any>;
}
