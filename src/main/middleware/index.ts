
import Context from "../context";
import {EndpointConfig} from "../controller/config";

export interface MiddlewareResult {
    handler: () => Promise<any>,
    endpointConfig: EndpointConfig
}

export default interface Middleware {
    run (context: Context, start: () => Promise<MiddlewareResult>);
};
