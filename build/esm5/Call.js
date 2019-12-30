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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Adapters = __importStar(require("./Adapters"));
var Callable_1 = __importDefault(require("./Callable"));
var Messages_1 = require("./Messages");
var util_1 = require("./util");
// @ts-ignore
var WormholeCall = /** @class */ (function (_super) {
    __extends(WormholeCall, _super);
    function WormholeCall(ref) {
        var payloads = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            payloads[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this.payload = [];
        _this.id = util_1.uuid();
        _this.ref = ref;
        payloads.forEach(function (data) {
            var _a = Adapters.Request(data), payload = _a.payload, callbacks = _a.callbacks;
            _this.addCallbacks(callbacks);
            _this.payload.push(payload);
        });
        return _this;
    }
    WormholeCall.prototype.request = function () {
        return new Messages_1.CallMessage({ id: this.id, ref: this.ref, payload: this.payload }).encode();
    };
    WormholeCall.prototype.promise = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    };
    WormholeCall.prototype.hasAcceptMessage = function (id) {
        return this.id === id || this.hasCallback(id);
    };
    WormholeCall.prototype.receiveResult = function (message) {
        var _a = message.payload, result = _a[0], error = _a[1];
        if (error !== null) {
            this.reject(error);
        }
        else {
            this.resolve(result);
        }
        this.emit("done");
    };
    return WormholeCall;
}(Callable_1.default));
exports.default = WormholeCall;
//# sourceMappingURL=Call.js.map