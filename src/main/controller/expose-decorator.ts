
import {ExposeCondition, getEndpointConfig} from "./config";

export function expose (target: Object, propertyKey: string | symbol);
export function expose (condition: ExposeCondition): MethodDecorator;

export function expose (conditionOrTarget: ExposeCondition | Object, propertyKey?: string | symbol) {
    const builder = (condition: ExposeCondition) => (target: Object, propertyKey: string | symbol) => {
        const config = getEndpointConfig(target.constructor, propertyKey as string);
        config.expose = condition;
    };

    if (propertyKey) {
        const target = conditionOrTarget as Object;
        builder(() => true)(target, propertyKey);
    } else {
        const condition = conditionOrTarget as (() => boolean);
        return builder(condition);
    }
}
