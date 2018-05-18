
import "reflect-metadata";

import {Middleware as ConfigMiddleware} from "./middleware/registry";
import {Controller as ConfigController} from "./controller/registry";
import {Job as ConfigJob} from "./job/registry";
import {Entity as ConfigEntity} from "./database/registry";

import controller from "./controller/controller-decorator";

import bootstrap, {Config} from "./core/bootstrap";
import {provideDynamic, provideSingleton, remove as removeProvider} from "./injection/providers";
import {get, post, put, del} from "./controller/endpoint-decorators";
import {inject} from "./injection/injector";
import {request} from "./request/request-decorator";
import {transform} from "./transformer/transform-decorator";
import {include} from "./transformer/include-decorator";

import {Validation, ValidationItem, ValidationError} from "kompost-validation";

import Environment from "./context/environment";
import Controller from "./controller";
import Model from "./database/model";
import Middleware from "./middleware";
import Transformer from "./transformer/transformer";
import Request from "./request/request";
import Job from "./job/index";
import Context from "./context";
import ContextProvider from "./context/context-provider";
import BodyProvider from "./context/body-provider";
import HeaderProvider from "./context/header-provider";
import QueryProvider from "./context/query-provider";
import ResponseError from "./response/response-error";

export {
    Config, ConfigMiddleware, ConfigController, ConfigJob,
    ConfigEntity, Environment, Controller, Model, Middleware,
    Transformer, Request, Job, Context, Validation, ValidationItem,
    ContextProvider, BodyProvider, HeaderProvider, QueryProvider,
    ResponseError, ValidationError,

    provideSingleton, provideDynamic, removeProvider, bootstrap,
    controller, get, post, put, del, inject, request, transform,
    include
};
