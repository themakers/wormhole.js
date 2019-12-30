"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = __importDefault(require("events"));
var Callable = /** @class */ (function (_super) {
    __extends(Callable, _super);
    function Callable() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.callbacks = new Map();
        return _this;
    }
    Callable.prototype.addCallbacks = function (callbacks) {
        var _this = this;
        Object.entries(callbacks).forEach(function (_a) {
            var key = _a[0], callback = _a[1];
            _this.callbacks.set(key, callback);
        });
        return this;
    };
    Callable.prototype.hasCallback = function (key) {
        return this.callbacks.has(key);
    };
    Callable.prototype.executeCallback = function (key, args) {
        var _this = this;
        return Promise.resolve().then(function () {
            var callback = _this.callbacks.get(key);
            if (!callback) {
                throw new ReferenceError("Callback " + key + " is undefined");
            }
            // @ts-ignore
            return callback.apply(void 0, args);
        });
    };
    return Callable;
}(events_1.default));
exports.default = Callable;
//# sourceMappingURL=Callable.js.map