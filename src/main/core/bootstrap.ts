
import "reflect-metadata";

import * as Koa from "koa";
import * as KoaBodyParser from "koa-bodyparser";
import * as KoaRouter from "koa-router";
import * as serve from "koa-static";

import Environment from "../context/environment";
import Controller from "../controller";
import Middleware from "../middleware";
import Model from "../database/model";
import Job from "../job";

import {provideSingleton} from "../injection/providers";

import setupMiddleware from "../middleware/registry";
import setupControllers from "../controller/registry";
import setupJobs from "../job/registry";
import setupDatabase from "../database/registry";

export interface Config {
    environment: Environment,
    controllers: (new () => Controller)[],
    models: (new () => Model)[],
    middleware: (new () => Middleware)[],
    jobs: (new () => Job)[],
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
