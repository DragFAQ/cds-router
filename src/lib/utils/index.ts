/**
 * Created by Z on 2017-05-17.
 */

export const TAG_MIDDLE_METHOD = Symbol('MiddleMethod');

export const TAG_GLOBAL_METHOD = Symbol('GlobalMethod');

const MIDDLE_METHODS: Map<Function,Map<string,Function[]>> = new Map();

export function registMethod(target: any, key: string, deal: Function) {
    if (!MIDDLE_METHODS.has(target.constructor)) {
        MIDDLE_METHODS.set(target.constructor, new Map());
    }
    if (!MIDDLE_METHODS.get(target.constructor).has(key)) {
        MIDDLE_METHODS.get(target.constructor).set(key, []);
    }
    MIDDLE_METHODS.get(target.constructor).get(key).push(deal);
    target[TAG_MIDDLE_METHOD] = target.constructor[TAG_MIDDLE_METHOD] = MIDDLE_METHODS.get(target.constructor);
}

export function registGlobal(target: any, deal: Function) {
    if (!target[TAG_GLOBAL_METHOD]) {
        target[TAG_GLOBAL_METHOD] = [];
    }
    target[TAG_GLOBAL_METHOD].push(deal);
}