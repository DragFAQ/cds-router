import { TAG_CONTROLLER } from "./controller";
import { TAG_METHOD } from "./method";
import { TAG_MIDDLE_METHOD, TAG_GLOBAL_METHOD, TAG_MIDDLE_WARE } from "./utils";
import { TAG_DEFINITION_NAME } from "./definition";
import * as _ from "lodash";
import * as Router from "koa-router";

import koaSwagger from "koa2-swagger-ui";

export * from "./controller";

export * from "./definition";

export * from "./description";

export * from "./ischema";

export * from "./method";

export * from "./parameter";

export * from "./resolvers";

export * from "./response";

export * from "./summary";

export * from "./tag";

export interface ISwagger {
  swagger: string;
  info: {
    description?: string;
    version: string;
    title: string;
    termsOfService?: string;
    concat?: {
      email: string;
    };
    license?: {
      name: string;
      url: string;
    }
  };
  host?: string;
  basePath?: string;
  tags?: Array<{
    name: string;
    description?: string;
    externalDocs?: {
      description: string;
      url: string;
    }
  }>;
  schemes: string[];
  paths: {};
  definitions: {};
}

export interface IPath {
  tags: string[];
  summary: string;
  description: string;
  operationId: string;
  consumes: string[];
  produces: string[];
  parameters?: Array<{}>;
  responses: {};
  security: Array<{}>;
}

export const DEFAULT_SWAGGER: ISwagger = {
  basePath: "/v1/api",
  definitions: {},
  host: "localhost:3002",
  info: {
    title: "Koa-Joi-Swagger-TS server",
    version: "1.0.0"
  },
  paths: {},
  schemes: ["http"],
  swagger: "2.0"
};

export enum HTTPStatusCodes {
  success = 200,
  internalServerError = 500,
  created = 201,
  other = 303,
  badRequest = 400
}

export enum Tags {
  tagController = "Controller"
}

export const DEFAULT_PATH: IPath = {
  consumes: ["application/json", "multipart/form-data", "application/x-www-form-urlencoded"],
  description: "",
  operationId: undefined,
  produces: ["application/json", "multipart/form-data", "application/x-www-form-urlencoded"],
  responses: {[HTTPStatusCodes.success]: {description: "Success"}},
  security: [],
  summary: "",
  tags: []
};

const FIRST_SCHEMA = 0;

export class KJSRouter {

  private readonly _swagger: ISwagger;

  private _router: Router = new Router();

  private _swaggerFileName: string;

  constructor(swagger: ISwagger = DEFAULT_SWAGGER) {
    this._swagger = swagger;
  }

  public loadController(Controller: any, decorator: Function = null): void {
    if (Controller[TAG_CONTROLLER]) {
      const allMethods = Controller[TAG_METHOD] || new Map();
      const paths = [...allMethods.keys()];
      const middleMethods = Controller[TAG_MIDDLE_METHOD] || new Map();
      const middleWares = Controller[TAG_MIDDLE_WARE] || new Map();
      paths.forEach((path) => {
        const temp = {};
        const fullPath = (Controller[TAG_CONTROLLER] + path).replace(this._swagger.basePath, "");
        const methods = allMethods.get(path);
        for (const [k, v] of methods) {
          const router = _.cloneDeep(DEFAULT_PATH);
          const mMethods = middleMethods.get(v.key);
          const wares = middleWares.has(v.key) ? [...middleWares.get(v.key)] : [];
          if (mMethods) {
            for (let i = 0, len = mMethods.length; i < len; i++) {

              mMethods[i](router, this._swagger);
            }
          }
          temp[k] = router;
          if (this._router[k]) {
            this._router[k]((Controller[TAG_CONTROLLER] + path).replace(/{(\w+)}/g, ":$1"), ...(wares.concat(decorator ? async (ctx, next) => {
              await decorator(v.handle, ctx, next, router.summary);
            } : v.handle)));
          }
        }
        this._swagger.paths[fullPath] = temp;
      });
    }
  }

  public loadDefinition(Definition: any): void {
    if (Definition[TAG_DEFINITION_NAME]) {
      const globalMethods = Definition[TAG_GLOBAL_METHOD] || [];
      globalMethods.forEach((deal) => {
        deal(this._swagger);
      });
    }
  }

  public setSwaggerFile(fileName: string): void {
    this._swaggerFileName = this._swagger.basePath + "/" + fileName;
    this._router.get(this._swaggerFileName, (ctx, next) => {
      ctx.body = JSON.stringify(this._swagger);
    });
  }

  public getSwaggerFile(): string {
    return this._swaggerFileName;
  }

  public loadSwaggerUI(url: string): void {
    this._router.get(url, koaSwagger({
      routePrefix: false,
      swaggerOptions: {
        url: this._swagger.schemes[FIRST_SCHEMA] + "://" + this._swagger.host + this._swaggerFileName
      }
    }));
  }

  public getRouter(): Router {
    return this._router;
  }

}
