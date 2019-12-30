import Callable from "./Callable";
export default class WormholeCall extends Callable {
    private payload;
    private ref;
    private reject;
    private resolve;
    private id;
    constructor(ref: string, ...payloads: any[]);
    request(): (string | number)[];
    promise(): Promise<any>;
    hasAcceptMessage(id: string): boolean;
    receiveResult(message: any): void;
}
