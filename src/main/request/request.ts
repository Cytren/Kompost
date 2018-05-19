
import {Validation, ValidationError, validateAndTransform} from "kompost-validation";

import ResponseError from "../response/response-error";
import Context from "../context";
import {AnyObject} from "../core/type";

export interface Request<M> {
    readonly type: new () => M;
    item (context: Context): Promise<M>;
    collection (context: Context): Promise<M[]>;
}

export class BasicRequest<M> implements Request<M> {
    constructor (readonly type: new () => M,
                 private validation: Validation,
                 private thenHandler: (model: AnyObject, fail: (error: string) => void) => Promise<void>,
                 private buildHandler: (model: AnyObject) => Promise<M>) {}

    protected fail (message: string) {
        throw new ValidationError(message);
    }

    private getData ({ method, query, request }: Context) {
        return (method === "GET" || method === "DELETE") ? query : request.body;
    }

    public async item (context: Context): Promise<M> {
        const data = this.getData(context);

        try {
            const model = validateAndTransform(this.validation, data);
            await this.thenHandler(model, this.fail);
            return await this.buildHandler(model);
        } catch (e) {
            if (!(e instanceof ValidationError)) { throw e; }
            const error = e as ValidationError;
            throw new ResponseError(422, { message: error.value });
        }
    }

    public async collection (context: Context): Promise<M[]> {
        const dataEntities = this.getData(context);
        const result: M[] = [];

        for (const [ index, data ] of dataEntities.entries()) {
            try {
                const model = validateAndTransform(this.validation, data);

                try {
                    await this.thenHandler(model, this.fail);
                    result.push(await this.buildHandler(model));
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
