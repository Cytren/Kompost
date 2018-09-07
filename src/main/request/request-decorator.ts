
import {getEndpointConfig} from "../controller/config";
import {Request} from "./index";

export function request (request: new () => Request<any>): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {

        const config = getEndpointConfig(target.constructor, propertyKey as string);
        config.request = request;
    }
}
