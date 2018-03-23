
import {getEndpointConfig} from "../controller/config";

export function request (request: Function): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {

        const config = getEndpointConfig(target.constructor, propertyKey as string);
        config.request = request;
    }
}
