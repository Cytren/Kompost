
import {Request} from "../";
import Context from "../context";
import Controller from "./index";

export const CONFIG_KEY = "$__controller__config__$";
export type MethodType = "GET" | "POST" | "PUT" | "DELETE";
export type ExposeCondition = (context: Context) => boolean;

export interface ParameterConfig {
    name: string;
    type: any;
}

export interface EndpointConfig {
    path: string;
    method: MethodType;
    request?: new (...args: any[]) => Request<any>;
    transformer?: Function;
    parameters?: ParameterConfig[];
    expose?: ExposeCondition;
}

export default interface ControllerConfig {
    path: string;
    endpoints: { [functionName: string]: EndpointConfig };
    children: (new () => Controller)[];
}

export function getControllerConfig (controller: Function): ControllerConfig {
    let config = controller[CONFIG_KEY];

    if (!config) {
        config = {};
        config.endpoints = {};
        config.children = [];
        controller[CONFIG_KEY] = config;
    }

    return config;
}

export function getEndpointConfig (controller: Function, functionName: string): EndpointConfig {
    const controllerConfig = getControllerConfig(controller);
    let config: any = controllerConfig.endpoints[functionName];

    if (!config) {
        config = {};
        config.parameters = [];
        controllerConfig.endpoints[functionName] = config;
    }

    return config;
}
