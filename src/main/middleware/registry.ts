
import * as KoaRouter from "koa-router";

export type Middleware = Function;

export default function setupMiddleware (router: KoaRouter, middleware: Middleware[]) {

    middleware.forEach(item => {
        const instance = new (item as any);
        router.use(instance.run.bind(instance));
    });
}
