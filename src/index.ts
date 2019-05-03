import {TAG_CONTROLLER} from "./controller";
import {TAG_METHOD} from "./method";
import {TAG_MIDDLE_METHOD, TAG_GLOBAL_METHOD, TAG_MIDDLE_WARE} from "./utils";
import {TAG_DEFINITION_NAME} from "./definition";
import * as _ from "lodash";
import * as Router from "koa-router";

const koaSwagger = require("koa2-swagger-ui");

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
  tags?: {
    name: string;
    description?: string;
    externalDocs?: {
      description: string;
      url: string;
    }
  }[];
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
  parameters?: any[];
  responses: any;
  security: any[];
}

export const DEFAULT_SWAGGER: ISwagger = {
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "Koa-Joi-Swagger-TS server"
  },
  host: "localhost:3002",
  basePath: "/v1/api",
  schemes: ["http"],
  paths: {},
  definitions: {}
};

export const DEFAULT_PATH: IPath = {
  tags: [],
  summary: "",
  description: "",
  operationId: undefined,
  consumes: ["application/json"],
  produces: ["application/json"],
  responses: {"200": {description: "Success"}},
  security: []
};

export class KJSRouter {

  swagger: ISwagger;

  router: Router = new Router();

  swaggerFileName: string;

  constructor(swagger: ISwagger = DEFAULT_SWAGGER) {
    this.swagger = swagger;
  }

  loadController(Controller, decorator = null) {
    if (Controller[TAG_CONTROLLER]) {
      const allMethods = Controller[TAG_METHOD] || new Map();
      const paths = [...allMethods.keys()];
      const middleMethods = Controller[TAG_MIDDLE_METHOD] || new Map();
      const middleWares = Controller[TAG_MIDDLE_WARE] || new Map();
      paths.forEach((path) => {
        const temp = {};
        const fullPath = (Controller[TAG_CONTROLLER] + path).replace(this.swagger.basePath, "");
        const methods = allMethods.get(path);
        for (let [k, v] of methods) {
          let router = _.cloneDeep(DEFAULT_PATH);
          const methods = middleMethods.get(v.key);
          const wares = middleWares.has(v.key) ? [...middleWares.get(v.key)] : [];
          if (methods) {
            for (let i = 0, len = methods.length; i < len; i++) {

              methods[i](router, this.swagger);
            }
          }
          temp[k] = router;
          if (this.router[k]) {
            this.router[k]((Controller[TAG_CONTROLLER] + path).replace(/{(\w+)}/g, ":$1"), ...(wares.concat(decorator ? async (ctx, next) => {
              await decorator(v.handle, ctx, next, router.summary);
            } : v.handle)));
          }
        }
        this.swagger.paths[fullPath] = temp;
      });
    }
  }

  loadDefinition(Definition) {
    if (Definition[TAG_DEFINITION_NAME]) {
      const globalMethods = Definition[TAG_GLOBAL_METHOD] || [];
      globalMethods.forEach((deal) => {
        deal(this.swagger);
      })
    }
  }

  setSwaggerFile(fileName: string) {
    this.swaggerFileName = this.swagger.basePath + "/" + fileName;
    this.router.get(this.swaggerFileName, (ctx, next) => {
      ctx.body = JSON.stringify(this.swagger)
    });
  }

  loadSwaggerUI(url: string) {
    this.router.get(url, koaSwagger({
      routePrefix: false,
      swaggerOptions: {
        url: this.swagger.schemes[0] + "://" + this.swagger.host + this.swaggerFileName,
      }
    }));
  }

  getRouter() {
    return this.router;
  }

}
