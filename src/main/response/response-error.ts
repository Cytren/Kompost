
export default class ResponseError extends Error {

    constructor (readonly status: number, readonly error?: any) {
        super(`Response Error\n${status}\n${JSON.stringify(error, undefined, '  ')}`);
        Object.setPrototypeOf(this, ResponseError.prototype);
    }
}
