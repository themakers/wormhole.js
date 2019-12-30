import * as Adapters from "./Adapters";
import Callable from "./Callable";
import { CallMessage } from "./Messages";
import { uuid } from "./util";
// @ts-ignore
export default class WormholeCall extends Callable {
    constructor(ref, ...payloads) {
        super();
        this.payload = [];
        this.id = uuid();
        this.ref = ref;
        payloads.forEach((data) => {
            const { payload, callbacks } = Adapters.Request(data);
            this.addCallbacks(callbacks);
            this.payload.push(payload);
        });
    }
    request() {
        return new CallMessage({ id: this.id, ref: this.ref, payload: this.payload }).encode();
    }
    promise() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    hasAcceptMessage(id) {
        return this.id === id || this.hasCallback(id);
    }
    receiveResult(message) {
        const [result, error] = message.payload;
        if (error !== null) {
            this.reject(error);
        }
        else {
            this.resolve(result);
        }
        this.emit("done");
    }
}
//# sourceMappingURL=Call.js.map