import Callable from "./Callable";
import { IWormholeClientOptions } from "./types";
declare class WormholeClient extends Callable {
    private options;
    private connection;
    private calls;
    constructor(url: string, options?: IWormholeClientOptions);
    connect(): Promise<void>;
    disconnect(): void;
    provide(service: string, methods: any): void;
    call(part: string | number | symbol): any;
    private onConnectionMessage;
    private send;
    private sendMessage;
    private onReceiveMessage;
    private onReceiveCall;
    private onReceiveResult;
    private onDoneCall;
    private onDisconnect;
    private onConnectionError;
}
declare const _default: (url: string, options?: IWormholeClientOptions) => WormholeClient;
export default _default;
