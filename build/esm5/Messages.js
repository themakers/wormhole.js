"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constraints_1 = require("./constraints");
var CallMessage = /** @class */ (function () {
    function CallMessage(_a) {
        var _b = _a === void 0 ? {} : _a, id = _b.id, ref = _b.ref, payload = _b.payload;
        this.id = id;
        this.ref = ref;
        this.payload = payload;
    }
    CallMessage.prototype.encode = function () {
        return [
            constraints_1.WORMHOLE_VERSION,
            constraints_1.WORMHOLE_TYPE_CALL,
            this.id,
            this.ref,
            this.payload,
        ];
    };
    CallMessage.prototype.decode = function (message) {
        this.id = message[2];
        this.ref = message[3];
        this.payload = message[4];
        return this;
    };
    Object.defineProperty(CallMessage.prototype, "type", {
        get: function () {
            return constraints_1.WORMHOLE_TYPE_CALL;
        },
        enumerable: true,
        configurable: true
    });
    return CallMessage;
}());
exports.CallMessage = CallMessage;
// tslint:disable-next-line:max-classes-per-file
var ResultMessage = /** @class */ (function () {
    function ResultMessage(_a) {
        var _b = _a === void 0 ? {} : _a, id = _b.id, ref = _b.ref, payload = _b.payload;
        this.id = id;
        this.ref = ref;
        this.payload = payload;
    }
    ResultMessage.prototype.encode = function () {
        return [
            constraints_1.WORMHOLE_VERSION,
            constraints_1.WORMHOLE_TYPE_RESULT,
            this.id,
            this.payload,
        ];
    };
    ResultMessage.prototype.decode = function (message) {
        this.id = message[2];
        this.payload = message[3];
        return this;
    };
    Object.defineProperty(ResultMessage.prototype, "type", {
        get: function () {
            return constraints_1.WORMHOLE_TYPE_RESULT;
        },
        enumerable: true,
        configurable: true
    });
    return ResultMessage;
}());
exports.ResultMessage = ResultMessage;
//# sourceMappingURL=Messages.js.map