/**
 * Created by iZhui on 2017/5/12.
 */

export const TAG_DEFINITION = Symbol('Definition');

export const TAG_JOI_VALIDATE = Symbol('JoiValidate');

import {validate, object} from 'joi';

/**
 * Definition
 * @param name
 * @returns {(Definition:Function)=>undefined}
 */
export function definition(name?: string): ClassDecorator {
    return function (Definition: FunctionConstructor) {
        if (!name) {
            name = Definition.name;
        }
        Definition[TAG_DEFINITION] = name;
        const definition = new Definition();
        let keys = {};
        keys = Object.assign({}, definition);
        const schema = object().keys(keys);
        Definition[TAG_JOI_VALIDATE] = (input: Object) => {
            return validate(input, schema);
        }
    }
}