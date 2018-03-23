
export const INCLUDES_KEY = "$__transformer__includes__$";

export function getIncludes (transformer: object): object {
    let includes = transformer[INCLUDES_KEY];

    if (!includes) {
        includes = {};
        transformer[INCLUDES_KEY] = includes;
    }

    return includes;
}

export function include (name: string): MethodDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const includes = getIncludes(target);
        includes[name] = propertyKey;
    }
}
