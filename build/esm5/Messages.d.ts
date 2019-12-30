export declare class CallMessage {
    payload: string;
    id: string;
    ref: string;
    constructor({ id, ref, payload }?: any);
    encode(): (string | number)[];
    decode(message: any): this;
    readonly type: number;
}
export declare class ResultMessage {
    payload: string;
    id: string;
    ref: string;
    constructor({ id, ref, payload }?: any);
    encode(): (string | number)[];
    decode(message: any): this;
    readonly type: number;
}
