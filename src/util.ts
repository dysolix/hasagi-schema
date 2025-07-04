import fs from "fs/promises";
import { TYPESCRIPT_TYPE_NAME_OVERRIDES } from "./overrides.js";

function requiresQuotes(fieldName: string) {
    return fieldName.includes("-") || /\d/.test(fieldName)

}

export function formatFieldName(fieldName: string) {
    if (requiresQuotes(fieldName)) {
        return `"${fieldName}"`;
    }
    return fieldName;
}

const OUT_DIR = "./schema/out";

export async function writeJsonFile(name: string, json: any) {
    await fs.writeFile(`${OUT_DIR}/${name}.json`, JSON.stringify(json, null, 4))
}

export function getType(t: { type: string, elementType: string } | string, namespace?: string): string {
    switch (typeof t === "string" ? t : t.type) {
        case "string":
            return "string"
        case "uint8":
        case "uint16":
        case "uint32":
        case "uint64":
        case "int8":
        case "int16":
        case "int32":
        case "int64":
        case "double":
        case "float":
            return "number"
        case "bool":
            return "boolean"
        case "vector":
            return `${getType((t as any).elementType), namespace}[]`
        case "map": {
            return `Record<string | number, ${getType((t as any).elementType), namespace}>`
        }
        case "object":
            return `Record<string, unknown>`
        case "":
            return "void";
        default:
            return namespace ? `${namespace}.${typeof t === "string" ? t : t.type}` : typeof t === "string" ? t : t.type
    }
}

export function formatForArrayLabel(str: string) {
    return kebabCaseToCamelCase(str).replace(/[^a-zA-Z_]/g, '');
}

function kebabCaseToCamelCase(str: string) {
    return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

export function getTypeScriptName(input: string) {
    input = input.replaceAll("-", "_");
    if (TYPESCRIPT_TYPE_NAME_OVERRIDES[input])
        input = TYPESCRIPT_TYPE_NAME_OVERRIDES[input];

    return input;
}

export function getSwaggerTypeName(input: string) {
    if (TYPESCRIPT_TYPE_NAME_OVERRIDES[input])
        input = TYPESCRIPT_TYPE_NAME_OVERRIDES[input];

    return input;
}