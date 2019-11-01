"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuid = function () {
    var mask = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    // tslint:disable-next-line:no-bitwise
    return mask.replace(/[xy]/g, function (c, r) { return ("x" === c ? (r = Math.random() * 16 | 0) : (r & 0x3 | 0x8)).toString(16); });
};
//# sourceMappingURL=util.js.map