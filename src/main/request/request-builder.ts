
import {Validation} from "kompost-validation";
import {AnyObject} from "../core/type";
import {Request, BasicRequest} from "./request";

function createDefaultBuildHandler<M> (type: new () => M) {
    return async (model: new () => M): Promise<M> => {
        const process = (model: AnyObject, result: AnyObject) => {
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

        const instance = new type;
        process(model, instance);

        return instance;
    };
}

export class RequestBuilder<M> {
    private validation: Validation;
    private buildHandler: (model: AnyObject, fail: (error: string) => void) => Promise<M>;

    constructor (private type: new () => M) {
        this.buildHandler = createDefaultBuildHandler(type);
    }

    validate (validation: Validation): RequestBuilder<M> {
        this.validation = validation;
        return this;
    }

    build (buildHandler?: (model: AnyObject) => Promise<M>): Request<M> {
        if (buildHandler) {
            this.buildHandler = buildHandler;
        }

        return new BasicRequest<M>(this.type, this.validation, this.buildHandler);
    }
}
