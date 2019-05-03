import {TAG_DEFINITION_NAME, TAG_DEFINITION_DESCRIPTION} from './definition';

import * as joi from 'joi';

import * as j2s from 'joi-to-swagger';

export interface ISchema {
    type?: string;
    required?: boolean;
    items?: ISchema;
    $ref?: Function;
}

export function toSwagger(iSchema: ISchema | joi.Schema): any {
    if (iSchema['isJoi']) {
        return j2s(iSchema).swagger;
    }
    let items = undefined;
    let $ref: any = iSchema['$ref'];
    let description = undefined;
    if (iSchema['items']) {
        items = toSwagger(iSchema['items']);
        $ref = items['$ref'];
    }
    if ($ref && $ref[TAG_DEFINITION_NAME]) {
        description = $ref[TAG_DEFINITION_DESCRIPTION];
        $ref = '#/definitions/' + $ref[TAG_DEFINITION_NAME];
    }
    let result = {items, type: iSchema['type'] || 'object', $ref, description};
    if (iSchema['required']) {
      result = Object.assign(result, {required: iSchema['required']});
    }
    return result;
}

export function toSchema(Definition) {
    let key = {};
    key = Object.assign(key, new Definition());
    return j2s(joi.object().keys(key)).swagger;
}

export function toJoi(iSchema: ISchema | joi.Schema): joi.Schema | ISchema {
    if (iSchema['isJoi']) {
        return iSchema;
    }
    let type = iSchema['type'] || 'object';
    let schema = null;
    let Ref: any = iSchema['$ref'] || (iSchema['items'] && iSchema['items'].$ref);
    let keys = {};
    if (Ref) {
        let ref = new Ref();
        keys = Object.assign({}, ref);
    }

    if (joi[type]) {
        schema = joi[type]();
    }
    if (Ref && Ref[TAG_DEFINITION_DESCRIPTION]) {
        schema = schema.description(Ref[TAG_DEFINITION_DESCRIPTION]);
    }
    if (schema && iSchema['required']) {
      schema = schema.required();
    }
    switch (type) {
        case 'object':
            return schema.keys(keys);
        case 'array':
            return schema.items(keys);
        case 'file':
            return iSchema['required'] ? joi.object().required() : joi.object();
        default:
            return schema;
    }
}
