
import {Validation} from "kompost-validation";
import {AnyObject} from "../core/type";
import {Request, BasicRequest, FailHandler} from "./index";
import Context from "../context";

export interface CreateRequestOptions<M> {
    validation?: Validation;
    validate?: (model: AnyObject, fail: FailHandler, context: Context) => Promise<void>;
    build?: (model: AnyObject, fail: FailHandler, context: Context) => Promise<M>;
}

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

export function createRequest<M> (type: new () => M, { validation, validate, build }: CreateRequestOptions<M>): Request<M> {
    return new BasicRequest<M>(
        type,
        validation || {},
        validate || (async () => {}),
        build || createDefaultBuildHandler(type)
    );
}
