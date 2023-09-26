import fs from "fs/promises";

export function formatFieldName(fieldName: string) {
    if (fieldName.includes("-")) {
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