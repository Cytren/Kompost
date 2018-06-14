
import * as KoaRouter from "koa-router";
import Middleware, {MiddlewareProvider} from "./"
import {provideSingleton} from "../injection/providers";

export default function setupMiddleware (router: KoaRouter, middleware: (new () => Middleware)[]) {
    const instances = middleware.map(item => {
        return new item;
    });

    provideSingleton(MiddlewareProvider, () => new MiddlewareProvider(instances));
}
