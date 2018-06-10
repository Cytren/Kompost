
import * as KoaRouter from "koa-router";
import MainMiddleware from "./main";

export type Middleware = Function;

export default function setupMiddleware (router: KoaRouter, middleware: Middleware[]) {
    if (middleware.length === 0) {
        const mainMiddlware = new MainMiddleware();
        router.use(mainMiddlware.run.bind(mainMiddlware));
    }

    middleware.forEach(item => {
        const instance = new (item as any);
        router.use(instance.run.bind(instance));
    });
}
