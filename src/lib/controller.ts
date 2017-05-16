/**
 * Created by Z on 2017-05-16.
 */


export const TAG_CONTROLLER = Symbol('Controller');

/**
 * Controller
 * @param path
 * @returns {(Controller:Function)=>undefined}
 */
export function controller(path?: string): ClassDecorator {
    return function (Controller: Function) {
        if (!path) {
            path = Controller.name;
        }
        Controller[TAG_CONTROLLER] = path;
    }
}