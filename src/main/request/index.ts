
import {Validation, ValidationError, validateAndTransform} from "kompost-validation";

import ResponseError from "../response/response-error";
import Context from "../context";

export type FailHandler = (error: string) => void;

export abstract class Request<M> implements Request<M> {
    public abstract readonly type: new () => M;
    protected abstract readonly validation: Validation = {};
    protected readonly trueInstance = true;

    protected createInstance (): M {
        return new this.type();
    }

    protected async validate (model: any, fail: FailHandler, context: Context): Promise<void> {}

    protected async build (model: any, fail: FailHandler, context: Context): Promise<M> {
        if (!this.trueInstance) { return model as any; }

        const process = <M> (model: object, result: M) => {
            Object.entries(model)
                .forEach(([key, value]) => {
                    if (typeof value === "object") {
                        result[key] = {};
                        process(value, result[key]);
                    } else {
                        result[key] = value;
                    }
                });
        };

        const instance = this.createInstance();
        process(model, instance);

        return instance;
    }

    private fail (message: string) {
        throw new ValidationError(message);
    }

    private getData ({ method, query, request }: Context) {
        return (method === "GET" || method === "DELETE") ? query : request.body;
    }

    public async item (context: Context): Promise<M> {
        const data = this.getData(context);

        try {
            const model = validateAndTransform(this.validation, data);
            await this.validate(model, this.fail, context);
            return await this.build(model, this.fail, context);
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
                    await this.validate(model, this.fail, context);
                    result.push(await this.build(model, this.fail, context));
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
