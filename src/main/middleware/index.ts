
import Context from "../context";
import {EndpointConfig} from "../controller/config";

export interface MiddlewareParams {
    endpointConfig: EndpointConfig
}

export default interface Middleware {
    run (context: Context, next: () => Promise<void>, params: MiddlewareParams): Promise<void>;
};

export class MiddlewareProvider {
    constructor (readonly middleware: Middleware[]) {}
}
