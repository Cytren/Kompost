
import * as KoaRouter from "koa-router";
import {getControllerConfig} from "./config";
import {getInjection} from "../injection/injector";
import Context from "../context";
import Response from "../response/response";
import ResponseError from "../response/response-error";
import ValidationError from "../request/validation-error";
import Request from "../request/request";
import Transformer from "../transformer/transformer";
import Paginated from "../response/paginated";
import QueryProvider from "../context/query-provider";
import HeaderProvider from "../context/header-provider";
import BodyProvider from "../context/body-provider";
import ContextProvider from "../context/context-provider";

export type Controller = Function;

export default function setupControllers (router: KoaRouter, controllers: Controller[]) {

    controllers.forEach(controller => {
        const controllerInstance = new (controller as any);
        const config = getControllerConfig(controller);
        const basePath = config.path;

        Object.entries(config.endpoints).forEach(([functionName, endpointConfig]) => {

            const endpoint = controllerInstance[functionName].bind(controllerInstance);
            const endpointPath = endpointConfig.path === "/" ? "" : endpointConfig.path;
            const path = `/${basePath}/${endpointPath}`;

            let routerFunction: (path: string, handler: (context: Context) => Promise<void>) => void;

            switch (endpointConfig.method) {
                case "GET": routerFunction = router.get.bind(router); break;
                case "POST": routerFunction = router.post.bind(router); break;
                case "PUT": routerFunction = router.put.bind(router); break;
                case "DELETE": routerFunction = router.delete.bind(router); break;
            }

            routerFunction(path, async (context: Context) => {
                try {
                    const request: Request<any> = endpointConfig.request ?
                        new (endpointConfig.request as any)(context) :
                        undefined;

                    const parameters = [];

                    for (let parameter of endpointConfig.parameters) {
                        // inject queries
                        if (parameter.type === QueryProvider) {
                            parameters.push(new QueryProvider(context.query));
                            continue;
                        }

                        // inject headers
                        if (parameter.type === HeaderProvider) {
                            parameters.push(new HeaderProvider(context.headers));
                            continue;
                        }

                        // inject body
                        if (parameter.type === BodyProvider) {
                            parameters.push(new BodyProvider(context.request.body));
                            continue;
                        }

                        // inject context
                        if (parameter.type === ContextProvider) {
                            parameters.push(new ContextProvider(context));
                            continue;
                        }

                        // inject route parameter
                        if (parameter.type === String) {
                            parameters.push(context.params[parameter.name]);
                            continue;
                        }

                        // inject request item
                        if (request && parameter.type === request.type) {
                            parameters.push(await request.item());
                            continue;
                        }

                        // inject request collection
                        if (parameter.type === Array) {
                            parameters.push(await request.collection());
                            continue;
                        }

                        // inject service
                        try {
                            parameters.push(getInjection(parameter.type));
                            continue;
                        } catch (e) {}

                        throw new Error("Invalid parameters.");
                    }

                    const result = await endpoint(...parameters);

                    if (result instanceof Response) {
                        context.status = result.status;
                        context.body = result.data;
                    }

                    if (typeof result === "number") {
                        context.status = result;
                    } else if (endpointConfig.transformer) {

                        const includeString: string = context.query["include"];
                        const includes = includeString ? includeString.split(",") : [];
                        const transformer: Transformer<any> = new (endpointConfig.transformer as any)(includes);

                        if (result instanceof Paginated) {
                            const data = await transformer.collection(result.data);

                            context.body = {
                                start: result.start,
                                count: result.data.length,
                                left: result.left,
                                total: result.total,
                                data
                            };
                        } else if (Array.isArray(result)) {
                            context.body = await transformer.collection(result);
                        } else {
                            context.body = await transformer.item(result);
                        }
                    } else {
                        context.body = result;
                    }

                } catch (e) {
                    if (e instanceof ValidationError) {
                        context.status = 422;
                        context.body = { error: e.value || {} };
                        return;
                    }

                    if (e instanceof ResponseError) {
                        context.status = e.status;
                        context.body = e.error || {};
                        return;
                    }

                    throw e;
                }
            });
        });
    });

}
