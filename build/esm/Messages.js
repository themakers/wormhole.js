import { WORMHOLE_TYPE_CALL, WORMHOLE_TYPE_RESULT, WORMHOLE_VERSION } from "./constraints";
export class CallMessage {
    constructor({ id, ref, payload } = {}) {
        this.id = id;
        this.ref = ref;
        this.payload = payload;
    }
    encode() {
        return [
            WORMHOLE_VERSION,
            WORMHOLE_TYPE_CALL,
            this.id,
            this.ref,
            this.payload,
        ];
    }
    decode(message) {
        this.id = message[2];
        this.ref = message[3];
        this.payload = message[4];
        return this;
    }
    get type() {
        return WORMHOLE_TYPE_CALL;
    }
}
// tslint:disable-next-line:max-classes-per-file
export class ResultMessage {
    constructor({ id, ref, payload } = {}) {
        this.id = id;
        this.ref = ref;
        this.payload = payload;
    }
    encode() {
        return [
            WORMHOLE_VERSION,
            WORMHOLE_TYPE_RESULT,
            this.id,
            this.payload,
        ];
    }
    decode(message) {
        this.id = message[2];
        this.payload = message[3];
        return this;
    }
    get type() {
        return WORMHOLE_TYPE_RESULT;
    }
}
//# sourceMappingURL=Messages.js.map