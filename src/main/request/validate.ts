
import {ValidateOptions, Validation} from "./validation";
import ValidationError from "./validation-error";

export default function validate (rules: Validation, model: any): any {
    const result = { ...model };

    const typeError = (key: string, type: string) => {
        throw new ValidationError({
            key, expectedType: type
        });
    };

    const process = (key: string, value: any, model: any, fullKey: string) => {
        if (!model) {
            throw new ValidationError({
                key: fullKey,
                error: "Required property is missing"
            });
        }

        if (!Array.isArray(value) && value instanceof Object) {
            Object.entries(value).forEach(([subKey, value]) => {
                process(subKey, value, model[key], `${fullKey}.${subKey}`);
            });

            return;
        }

        const options: ValidateOptions[] = Array.isArray(value) ? value : [value];
        if (options.includes("optional") && !model[key]) { return; }

        options.forEach(option => {
            switch (option) {

                case "integer":
                    if (typeof model[key] === "string") {
                        try {
                            model[key] = parseInt(model[key]);
                        } catch (e) {}
                    }

                    if (typeof model[key] !== "number" || !Number.isInteger(model[key])) {
                        typeError(fullKey, "integer");
                    }
                    break;

                case "number":
                    if (typeof model[key] === "string") {
                        try {
                            model[key] = parseFloat(model[key]);
                        } catch (e) {}
                    }

                    if (typeof model[key] !== "number") {
                        typeError(fullKey, "number");
                    }
                    break;

                case "string":
                    if (typeof model[key] !== "string") {
                        typeError(fullKey, "string");
                    }
                    break;

                case "character":
                    if (typeof model[key] !== "string" || model[key].length !== 1) {
                        typeError(fullKey, "character");
                    }
                    break;

                case "boolean":
                    if (typeof model[key] === "string") {
                        switch (model[key].toLowerCase()) {
                            case "true":
                            case "1":
                                model[key] = true;
                                break;

                            case "false":
                            case "0":
                                model[key] = false;
                                break;
                        }
                    }

                    if (typeof model[key] === "number") {
                        model[key] = model[key] !== 0;
                    }

                    if (typeof model[key] !== "boolean") {
                        typeError(fullKey, "boolean");
                    }
                    break;

                default:
                    break;

            }
        });
    };

    Object.entries(rules).forEach(([key, value]) => process(key, value, result, key));
    return result;
}
