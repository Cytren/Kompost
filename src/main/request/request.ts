
import {Validation, validateAndTransform} from "kompost-validation";

import ResponseError from "../response/response-error";
import ValidationError from "./validation-error";
import Context from "../context";

export default abstract class Request<M> {
    public abstract type: any;
    protected abstract validation: Validation;
    protected abstract validate (model: any): Promise<M>;

    constructor (readonly context: Context) {}

    protected fail (message: string) {
        throw new ValidationError(message);
    }

    private getData () {
        return (this.context.method === "GET" || this.context.method === "DELETE") ?
            this.context.query :
            this.context.request.body;
    }

    public async item (): Promise<M> {
        const data = this.getData();

        try {
            const model = validateAndTransform(this.validation, data);
            return await this.validate(model);
        } catch (e) {
            if (!(e instanceof ValidationError)) { throw e; }
            const error = e as ValidationError;
            throw new ResponseError(422, { message: error.value });
        }
    }

    public async collection (): Promise<M[]> {
        const dataEntities = this.getData();
        const result: M[] = [];

        for (const [ index, data ] of dataEntities.entries()) {
            try {
                const model = validateAndTransform(this.validation, data);

                try {
                    result.push(await this.validate(model));
                } catch (e) {
                    if (!(e instanceof ValidationError)) { throw e; }
                    const error = e as ValidationError;
                    throw new ResponseError(422, { message: error.value, index });
                }

            } catch (e) {
                if (!(e instanceof ResponseError)) { throw e; }
                const error = e as ResponseError;
                throw new ResponseError(error.status, Object.assign(error.error, { index }));
            }
        }

        return result;
    }
}
