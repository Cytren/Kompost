
import {ValidateOptions, Validation, validTypes} from "./validation";
import ResponseError from "../response/response-error";
import ValidationError from "./validation-error";
import Context from "../context";
import validateModel from "./validate";

export default abstract class Request<M> {
    public abstract type: any;
    protected abstract validation: Validation;
    protected abstract validate (model: any): Promise<M>;

    constructor (readonly context: Context) {}

    protected fail (message: string) {
        throw new ValidationError(message);
    }

    validateRules () {
        const typeCount = (options: ValidateOptions[]) => {
            let count = 0;
            options.forEach(option => count += validTypes.includes(option) ? 1 : 0);
            return count;
        };

        const process = (key: string, value: any) => {
            if (!Array.isArray(value) && value instanceof Object) {
                Object.entries(value).forEach(([subKey, value]) => {
                    process(`${key}.${subKey}`, value);
                });

                return;
            }

            const options: ValidateOptions[] = Array.isArray(value) ? value : [value];
            const count = typeCount(options);

            if (count > 1) {
                throw new Error(`Conflicting validation types for ${key}`);
            }
        };

        Object.entries(this.validation).forEach(([key, value]) => process(key, value));
    }

    private getData () {
        return (this.context.method === "GET" || this.context.method === "DELETE") ?
            this.context.query :
            this.context.request.body;
    }

    public async item (): Promise<M> {
        this.validateRules();
        const data = this.getData();

        try {
            const model = validateModel(this.validation, data);
            return await this.validate(model);
        } catch (e) {
            if (!(e instanceof ValidationError)) { throw e; }
            const error = e as ValidationError;
            throw new ResponseError(422, { message: error.value });
        }
    }

    public async collection (): Promise<M[]> {
        this.validateRules();

        const dataEntities = this.getData();
        const result: M[] = [];

        for (const [ index, data ] of dataEntities.entries()) {
            try {
                const model = validateModel(this.validation, data);

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
