import {TAG_CONTROLLER} from "./controller";
import {TAG_METHOD} from "./method";
import {TAG_MIDDLE_METHOD, TAG_GLOBAL_METHOD} from "./utils/index";
import {TAG_DEFINITION_NAME} from "./definition";
/**
 * Created by Z on 2017-05-17.
 */

export interface ISWagger {
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
    parameters: any[];
    responses: any;
    security: any[];
}

export const DEFAULT_SWAGGER: ISWagger = {
    swagger: '2.0',
    info: {
        version: "1.0.0",
        title: "CDS-Router"
    },
    host: 'localhost',
    basePath: "/v3/api",
    schemes: ['http'],
    paths: {},
    definitions: {}
};

export const DEFAULT_PATH: IPath = {
    tags: [],
    summary: '',
    description: '',
    operationId: undefined,
    consumes: ['application/json'],
    produces: ['application/json'],
    parameters: [],
    responses: {},
    security: []
}

export class CDSRouter {

    swagger: ISWagger;

    constructor(swagger: ISWagger = DEFAULT_SWAGGER) {
        this.swagger = swagger;
    }

    loadController(Controller) {
        if (Controller[TAG_CONTROLLER]) {
            const allMethods = Controller[TAG_METHOD] || new Map();
            const paths = [...allMethods.keys()];
            const middleMethods = Controller[TAG_MIDDLE_METHOD] || new Map();
            paths.forEach((path) => {
                const router = {};
                const fullPath = (Controller[TAG_CONTROLLER] + path).replace(this.swagger.basePath, '');
                const methods = allMethods.get(path);
                for (let [k, v] of methods) {
                    router[k] = Object.assign({}, DEFAULT_PATH);
                    (middleMethods.get(v.key) || []).forEach((deal) => {
                        deal(router[k], this.swagger);
                    });
                }
                this.swagger.paths[fullPath] = router;
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

}