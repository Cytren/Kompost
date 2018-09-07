
import {getProvider} from "./providers";

export function getInjection <T> (type: new (...args: any[]) => T, nameOrNull?: string): T {
    const provider = getProvider(type, nameOrNull);

    if (!provider) {
        return;
    }

    if (provider.type === "dynamic") {
        return provider.build();
    }

    if (!provider.instance) {
        provider.instance = provider.build();
    }

    return provider.instance;
}

export function inject (target: Object, propertyKey: string | symbol);
export function inject (name: string): PropertyDecorator;
export function inject (nameOrTarget: string | Object, propertyKey?: string | symbol) {

    const builder = (name: string) => {
        return (target: Object, propertyKey: string | symbol) => {
            const type = Reflect.getMetadata("design:type", target, propertyKey);

            Object.defineProperty(target, propertyKey,
                {
                    get: () => {
                        const instance = getInjection(type, name);
                        delete target[propertyKey];

                        Object.defineProperty(target, propertyKey, { get: () => instance });
                        return instance;
                    },
                    configurable: true
                }
            );
        };
    };

    if (propertyKey) {
        const target = nameOrTarget as Object;
        builder("default")(target, propertyKey);
    } else {
        const name = nameOrTarget as string;
        return builder(name);
    }
}
