
export interface Validation {
    [key: string]: ValidateOptions | ValidateOptions[] | Validation;
}

export type ValidationTypes =
    "integer" |
    "number" |
    "string" |
    "character" |
    "boolean";

export const validTypes = [
    "integer",
    "number",
    "string",
    "character",
    "boolean"
];

export type ValidateOptions = ValidationTypes | "optional";
