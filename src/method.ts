export const TAG_METHOD = Symbol('Method');

export interface IMethod {
    key: string;
    handle: Function;
}

/**
 *  If it is a class method annotation,
 *  typescript is implemented by prototype,
 *  btw,
 *  class User extends BaseController {
 *      @get('/')
 *      index(){
 *
 *      }
 *  }
 *
 *  will cause the parent controller annotation pollution
 */

/**
 * Prevent inheritance pollution
 * @type {Map<any, any>}
 */
const METHODS: Map<Function, Map<string, Map<string, IMethod>>> = new Map();

/**
 * Method
 * @param method
 * @param path
 * @returns {(target:Object, key:string)=>undefined}
 */
export function method(method?: string, path?: string): MethodDecorator {
    return function (target: Object, key: string) {
        if (!METHODS.has(target.constructor)) {
            METHODS.set(target.constructor, new Map());
        }
        if (!METHODS.get(target.constructor).has(path)) {
            METHODS.get(target.constructor).set(path, new Map());
        }
        METHODS.get(target.constructor).get(path).set(method, {key, handle: target[key]});
        target[TAG_METHOD] = target.constructor[TAG_METHOD] = METHODS.get(target.constructor);
    }
}


export const get = (path?: string) => method('get', path);
export const put = (path?: string) => method('put', path);
export const del = (path?: string) => method('delete', path);
export const post = (path?: string) => method('post', path);
export const patch = (path?: string) => method('patch', path);
