export type ErrorHandlerFunction = (error: any) => any;

export function safe(fn?: ErrorHandlerFunction, throwNext?: boolean) {

    return function (target: Object, propertyKey: string /*, descriptor: TypedPropertyDescriptor<any> */): TypedPropertyDescriptor<any> {
        // ES3 COMPATIBILITY FIX: descriptor from 3rd parameter was ignored
        const descriptor: TypedPropertyDescriptor<any> = Object.getOwnPropertyDescriptor(target, propertyKey);
        // store original method
        const originalMethod = descriptor.value;
        // change it to our cover method
        descriptor.value = async function NoErrorWrapper () {
            try {
                await originalMethod.apply(this, arguments);
            } catch(error) {
                if(typeof fn === 'function') {
                    await fn(error);
                }
                if(throwNext == true) {
                    throw error;
                }
            }
        };
        // ES3 COMPATIBILITY FIX: because returned descriptor value can be ignored
        Object.defineProperty(target, propertyKey, descriptor);
        // returning changed descriptor
        return descriptor;
    }
}

export type MiddlewareFunction = (ctx: any, next?: () => any) => any;

export function before(...fn: MiddlewareFunction[]) {

    return function (target: Object, propertyKey: string /*, descriptor: TypedPropertyDescriptor<any> */): TypedPropertyDescriptor<any> {
        // ES3 COMPATIBILITY FIX: descriptor from 3rd parameter was ignored
        const descriptor: TypedPropertyDescriptor<any> = Object.getOwnPropertyDescriptor(target, propertyKey);
        // store original method
        const originalMethod = descriptor.value;
        // change it to our cover method
        descriptor.value = async function MethodsList() {

            // call step by step all function from list
            fn.map(async (F) => await F.apply(this, arguments) );

            // if all functions end - call original method
            await originalMethod.apply(this, arguments);
        };
        // ES3 COMPATIBILITY FIX: because returned descriptor value can be ignored
        Object.defineProperty(target, propertyKey, descriptor);
        // returning changed descriptor
        return descriptor;
    }
}

export function after(...fn: MiddlewareFunction[]) {

    return function (target: Object, propertyKey: string /*, descriptor: TypedPropertyDescriptor<any> */): TypedPropertyDescriptor<any> {
        // ES3 COMPATIBILITY FIX: descriptor from 3rd parameter was ignored
        const descriptor: TypedPropertyDescriptor<any> = Object.getOwnPropertyDescriptor(target, propertyKey);
        // store original method
        const originalMethod = descriptor.value;
        // change it to our cover method
        descriptor.value = async function MethodsList() {

            // call original function
            await originalMethod.apply(this, arguments);

            // if all ok - call step by step all function from list
            fn.map(async (F) => await F.apply(this, arguments) );

        };
        // ES3 COMPATIBILITY FIX: because returned descriptor value can be ignored
        Object.defineProperty(target, propertyKey, descriptor);
        // change descriptor
        return descriptor;
    }
}
