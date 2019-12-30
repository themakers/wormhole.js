import EventEmitter from "events";
export default class Callable extends EventEmitter {
    constructor() {
        super(...arguments);
        this.callbacks = new Map();
    }
    addCallbacks(callbacks) {
        Object.entries(callbacks).forEach(([key, callback]) => {
            this.callbacks.set(key, callback);
        });
        return this;
    }
    hasCallback(key) {
        return this.callbacks.has(key);
    }
    executeCallback(key, args) {
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
//# sourceMappingURL=Callable.js.map