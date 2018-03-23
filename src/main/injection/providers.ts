
export type ProviderType = "singleton" | "dynamic";
export type ProviderBuilder = () => any;

export interface Provider {
    type: ProviderType;
    build: ProviderBuilder;
    instance?: any;
}

const providers: { [key: string]: Provider } = {};

export function getProvider (type: any, nameOrNull?: string) {
    const name = nameOrNull || "default";
    const key = `${name}-${type.name}`;
    return providers[key];
}

function createProvider (providerType: ProviderType, typeOrName: any | string,
                         builderOrType: ProviderBuilder | any, builderOrNull?: ProviderBuilder) {
    let name: string;
    let type: any;
    let builder: ProviderBuilder;

    if (!builderOrNull) {
        name = "default";
        type = typeOrName as any;
        builder = builderOrType as ProviderBuilder;
    } else {
        name = typeOrName as string;
        type = builderOrType as any;
        builder = builderOrNull;
    }

    const key = `${name}-${type.name}`;

    providers[key] = {
        type: providerType,
        build: builder
    };
}

export function provideSingleton (type: any, builder: ProviderBuilder);
export function provideSingleton (name: string, type: any, builder: ProviderBuilder);
export function provideSingleton (typeOrName: any | string, builderOrType: ProviderBuilder | any,
                                builderOrNull?: ProviderBuilder) {
    createProvider("singleton", typeOrName, builderOrType, builderOrNull);
}

export function provideDynamic (type: any, builder: ProviderBuilder);
export function provideDynamic (name: string, type: any, builder: ProviderBuilder);
export function provideDynamic (typeOrName: any | string, builderOrType: ProviderBuilder | any,
                                  builderOrNull?: ProviderBuilder) {
    createProvider("dynamic", typeOrName, builderOrType, builderOrNull);
}

export function remove (type: any);
export function remove (name: string, type: any);
export function remove (typeOrName: any | string, typeOrNull?: any) {
    let name: string;
    let type: any;

    if (!type) {
        name = "default";
        type = typeOrName as any;
    } else {
        name = typeOrName as string;
        type = typeOrNull as any;
    }

    const key = `${name}-${type.name}`;
    delete providers[key];
}
