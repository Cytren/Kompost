
import {getControllerConfig} from "./config";

export default function controller (path: string): ClassDecorator {
    return <TFunction extends Function> (target: TFunction) => {
        getControllerConfig(target).path = path;
    };
}
