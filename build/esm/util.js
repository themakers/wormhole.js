export const uuid = () => {
    const mask = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    // tslint:disable-next-line:no-bitwise
    return mask.replace(/[xy]/g, (c, r) => ("x" === c ? (r = Math.random() * 16 | 0) : (r & 0x3 | 0x8)).toString(16));
};
export const mapProvide = (module, methods) => {
    const result = {};
    for (const method in methods) {
        if (methods.hasOwnProperty(method)) {
            result[`${module}.${method}`] = methods[method];
        }
    }
    return result;
};
//# sourceMappingURL=util.js.map