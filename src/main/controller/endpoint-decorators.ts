
import {getEndpointConfig, MethodType} from "./config";

const FUNCTION_PARAMETER_REGEX = /function\s.*?\(([^)]*)\)/;
const SPLIT_ARGS_REGEX = /\s*,\s*/;

export function get (target: Object, propertyKey: string | symbol);
export function get (path: string): MethodDecorator;
export function get (pathOrTarget: string | Object, propertyKey?: string | symbol) {
    return run("GET", pathOrTarget, propertyKey);
}

export function post (target: Object, propertyKey: string | symbol);
export function post (path: string): MethodDecorator;
export function post (pathOrTarget: string | Object, propertyKey?: string | symbol) {
    return run("POST", pathOrTarget, propertyKey);
}

export function put (target: Object, propertyKey: string | symbol);
export function put (path: string): MethodDecorator;
export function put (pathOrTarget: string | Object, propertyKey?: string | symbol) {
    return run("PUT", pathOrTarget, propertyKey);
}

export function del (target: Object, propertyKey: string | symbol);
export function del (path: string): MethodDecorator;
export function del (pathOrTarget: string | Object, propertyKey?: string | symbol) {
    return run("DELETE", pathOrTarget, propertyKey);
}

function run (type: MethodType, pathOrTarget: string | Object, propertyKey?: string | symbol) {

    const builder = (path: string) => (target: Object, propertyKey: string | symbol) => {
        const config = getEndpointConfig(target.constructor, propertyKey as string);
        const parameterTypes = Reflect.getMetadata("design:paramtypes",
            target, propertyKey);

        const parameters = target[propertyKey].toString()
            .match(FUNCTION_PARAMETER_REGEX)[1]
            .split(SPLIT_ARGS_REGEX);

        config.parameters = parameterTypes.map((type, i) => ({
            name: parameters[i], type
        }));

        config.path = path;
        config.method = type;
    };

    if (propertyKey) {
        const target = pathOrTarget as Object;
        builder("/")(target, propertyKey);
    } else {
        const path = pathOrTarget as string;
        return builder(path);
    }
}
