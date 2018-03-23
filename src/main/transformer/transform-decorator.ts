
import {getEndpointConfig} from "../controller/config";

export function transform (transformer: Function): MethodDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const config = getEndpointConfig(target.constructor, propertyKey as string);
        config.transformer = transformer;
    }
}
