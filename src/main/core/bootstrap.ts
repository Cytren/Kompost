
import "reflect-metadata";

import * as Koa from "koa";
import * as KoaBodyParser from "koa-bodyparser";
import * as KoaRouter from "koa-router";
import * as serve from "koa-static";

import Environment from "../context/environment";
import {provideSingleton} from "../injection/providers";

import setupMiddleware, {Middleware} from "../middleware/registry";
import setupControllers, {Controller} from "../controller/registry";
import setupJobs, {Job} from "../job/registry";
import setupDatabase, {Entity} from "../database/registry";

export interface Config {
    environment: Environment,
    controllers: Controller[],
    models: Entity[],
    middleware: Middleware[],
    jobs: Job[],
}

export default async function bootstrap (config: Config) {
    const { environment } = config;
    provideSingleton(Environment, () => environment);

    const app = new Koa();
    const router = new KoaRouter({ prefix: "/api" });

    await setupDatabase(environment, config.models);

    app.use(KoaBodyParser());
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(serve("public"));

    setupMiddleware(router, config.middleware);
    setupControllers(router, config.controllers);
    setupJobs(environment, config.jobs);

    app.listen(environment.port);
}
