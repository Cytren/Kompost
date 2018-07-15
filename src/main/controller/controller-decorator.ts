
import {getControllerConfig} from "./config";
import Controller from "./index";

export default function controller (target: Object, propertyKey: string | symbol): void;
export default function controller (path: string): ClassDecorator;

export default function controller (pathOrTarget: string | Object, propertyKey?: string | symbol): ClassDecorator {
    if (propertyKey) {
        const target = pathOrTarget as any;
        const type = Reflect.getMetadata("design:type", target, propertyKey);

        const parentConfig = getControllerConfig(target.constructor);
        parentConfig.children.push(type);
        return;
    }

    return <T extends Function> (target: T) => {
        const config = getControllerConfig(target);
        config.path = pathOrTarget as string;

        const handleChildren = (path: string, children: (new () => Controller)[]) => {
            children.forEach(child => {
                const childConfig = getControllerConfig(child);
                childConfig.path = `${path}/${childConfig.path}`;
                handleChildren(childConfig.path, childConfig.children);
            });
        };

        handleChildren(config.path, config.children);
    };
}
