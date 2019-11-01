export const uuid = (): string => {
    const mask = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    // tslint:disable-next-line:no-bitwise
    return mask.replace(/[xy]/g, (c, r) => ("x" === c ? (r = Math.random() * 16 | 0) : (r & 0x3 | 0x8)).toString(16));
};

export const transformResponse = (response: any) => {
    const result = {};
    response.forEach(([key, value]) => {
        result[key] = value;
    });
    return result;
};

export const transformRequest = (request: any) => {
    const result = {callbacks: {}, payload: []};

    if (typeof request === "string") {
        result.payload.push(["", request]);
        return result;
    }

    for (const prop in request) {
        if (request.hasOwnProperty(prop)) {
            const value = request[prop];
            if (typeof value === "function") {
                const id = uuid();
                result.callbacks[id] = value;
                result.payload.push([prop, id]);
            } else {
                result.payload.push([prop, value]);
            }
        }
    }

    return result;
};
