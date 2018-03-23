
export default class ValidationError extends Error {

    constructor (readonly value: any) {
        super(`Validation Error\n${JSON.stringify(value, undefined, '  ')}`);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
