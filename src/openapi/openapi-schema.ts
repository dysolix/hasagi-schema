import { ComponentsObject, ExternalDocumentationObject, InfoObject, OpenAPIObject, OperationObject, ParameterObject, PathsObject, ReferenceObject, RequestBodyObject, ResponseObject, SchemaObject, SecurityRequirementObject, ServerObject, TagObject } from "./open-api-types.js";
import { formatFieldName } from "../util.js";

const TYPE_OVERRIDES: { [key: string]: { rename?: string, definition?: string } } = {
    "PluginResourceEvent": {
        definition:
            `\
interface PluginResourceEvent<DataType = unknown> {
	uri: string
	eventType: {{namespace}}PluginResourceEventType
	data: DataType
}` }
}

export default class OpenAPISchema implements OpenAPIObject {
    openapi!: string;
    info!: InfoObject;
    servers?: ServerObject[] | undefined;
    paths!: PathsObject;
    components?: ComponentsObject | undefined;
    security?: SecurityRequirementObject[] | undefined;
    tags?: TagObject[] | undefined;
    externalDocs?: ExternalDocumentationObject | undefined;

    constructor(schema: OpenAPIObject) {
        Object.assign(this, schema);
    }

    getTypeScriptInterfaces(namespace?: string) {
        if (this.components?.schemas === undefined)
            return [];


        return Object.entries(this.components.schemas).map(([name, schema]) => {
            if (TYPE_OVERRIDES[name] && TYPE_OVERRIDES[name].definition)
                return `export ${TYPE_OVERRIDES[TYPE_OVERRIDES[name].rename ?? name].definition}`.replaceAll("{{namespace}}", namespace !== undefined ? `${namespace}.` : "")

            if ("$ref" in schema) {
                return `export type ${name} = ${schema.$ref.split("/").at(-1)}`
            } else if (schema.enum !== undefined) {
                const jsdoc = getJSDocBySchemaObject(schema);
                return `${jsdoc !== null ? `${jsdoc}\n` : ""}export type ${name} = ${schema.enum.map(e => `"${e}"`).join(" | ")}`
            } else if (schema.type === "object") {
                const interfaceJsDoc = getJSDocBySchemaObject(schema);
                const _interface = [`${interfaceJsDoc !== null ? `${interfaceJsDoc}\n` : ""}export interface ${name.replaceAll("-", "_")} {`]
                if (schema.additionalProperties)
                    _interface.push(`\t[key: string | number]: ${schema.additionalProperties === true ? "any" : getTypeBySchemaObject(schema.additionalProperties, namespace)}`)
                if (schema.properties)
                    Object.entries(schema.properties).forEach(([name, property]) => {
                        const jsDoc = getJSDocBySchemaObject(property);
                        const required = schema.required?.includes(name) ?? false;
                        _interface.push(`${jsDoc !== null ? `\t${jsDoc.split("\n").join("\n\t")}\n` : ""}\t${formatFieldName(name)}${required ? "" : "?"}: ${getTypeBySchemaObject(property, namespace)}`)
                    })

                _interface.push("}");
                return _interface.join("\n");
            }

            return getTypeBySchemaObject(schema, namespace)
        });
    }

    getEndpointInterfaces(namespace?: string) {
        const endpoints: Record<string, Record<string, ReturnType<typeof getMethodInfo>>> = {}
        Object.entries(this.paths).forEach(([path, info]) => {
            endpoints[path] = {
                get: getMethodInfo(info.get, namespace),
                post: getMethodInfo(info.post, namespace),
                put: getMethodInfo(info.put, namespace),
                patch: getMethodInfo(info.patch, namespace),
                head: getMethodInfo(info.head, namespace),
                delete: getMethodInfo(info.delete, namespace),
            }
        })

        let endpointsStr = "export interface LCUEndpoints {\n";
        Object.entries(endpoints).map(([path, r]) => {
            endpointsStr += `\t"${path}": {\n`
            Object.entries(r).map(([method, types]) => endpointsStr += types !== undefined ? `\t\t${method}: { Parameters: ${types!.Parameter}, Body: ${types!.Body}, Response: ${types!.Response} }\n` : "")
            endpointsStr += "\t},\n"
        }).join("\t");
        endpointsStr += "}"

        return endpointsStr + "\n\n" +
            `// @ts-expect-error
export type LCUEndpoint<Method extends HttpMethod, Path extends EndpointsWithMethod<Method>> = LCUEndpointBodyType<Method, Path> extends never ? (...args: [...LCUEndpoints[Path][Method]["Parameters"]]) => Promise<LCUEndpointResponseType<Method, Path>> : (...args: [...LCUEndpoints[Path][Method]["Parameters"], body: LCUEndpointBodyType<Method, Path>]) => Promise<LCUEndpointResponseType<Method, Path>>
// @ts-expect-error
export type LCUEndpointResponseType<Method extends HttpMethod, Path extends EndpointsWithMethod<Method>> = LCUEndpoints[Path][Method]["Response"]
// @ts-expect-error
export type LCUEndpointBodyType<Method extends HttpMethod, Path extends EndpointsWithMethod<Method>> = LCUEndpoints[Path][Method]["Body"]

export type EndpointsWithMethod<Method extends HttpMethod> = { [K in keyof LCUEndpoints]: LCUEndpoints[K] extends { [key in Method]: { } } ? K : never }[keyof LCUEndpoints]

export type HttpMethod = "delete" | "get" | "head" | "patch" | "post" | "put";`
    }
}

function getMethodInfo(info: OperationObject | undefined, namespace?: string) {
    if (!info)
        return undefined;

    const pathParams = info.parameters?.filter(p => (p as ParameterObject).in === "path") as ParameterObject[] ?? [];
    const pathParamsObject = `${pathParams.map(p => `${p.name.replaceAll("-", "_").replaceAll("+", "")}: ${getTypeBySchemaObject(p.schema, namespace)}`).join(", ")}`;

    const queryParams = info.parameters?.filter(p => (p as ParameterObject).in === "query") as ParameterObject[] ?? [];
    const queryParamsObject = `{ ${queryParams.map(p => `"${p.name}"${p.required ? "" : "?"}: ${getTypeBySchemaObject(p.schema, namespace)}`).join(", ")} }`;

    return {
        Parameter: `[${pathParamsObject}${queryParams.length > 0 ? `${pathParams.length > 0 ? ", " : ""}params${queryParams.some(p => p.required) ? "" : "?"}: ${queryParamsObject}` : ""}]`,
        Body: info.requestBody !== undefined && "content" in info.requestBody ? getTypeBySchemaObject((info.requestBody as RequestBodyObject).content["application/json"]["schema"]!, namespace) : "never",
        Response: info.responses["2XX"] !== undefined && "content" in info.responses["2XX"] ? getTypeBySchemaObject((info.responses["2XX"] as ResponseObject)["content"]!["application/json"]["schema"]!, namespace) : "void"
    }
}

function getTypeBySchemaObject(schema: SchemaObject | ReferenceObject | undefined, namespace?: string): string {
    if (schema === undefined)
        return "void";

    if ("$ref" in schema)
        return `${namespace !== undefined ? `${namespace}.` : ""}${schema.$ref.split("/").at(-1)!}`;

    switch (schema.type) {
        case "string":
            return "string";
        case "number":
        case "integer":
            return "number";
        case "boolean":
            return "boolean";
        case "array":
            return getArrayTypeBySchemaObject(schema, namespace).split("\n").join("\n\t");
        case "object":
            return getObjectTypeBySchemaObject(schema, namespace).split("\n").join("\n\t");
        default:
            return `${namespace}.${TYPE_OVERRIDES[schema.type!].rename ? TYPE_OVERRIDES[schema.type!].rename : schema.type}` ?? "unknown";
    }
}

function getArrayTypeBySchemaObject(schema: SchemaObject, namespace?: string): string {
    if (schema.type !== "array")
        throw new Error();

    if (schema.items)
        return `${getTypeBySchemaObject(schema.items, namespace)}[]`;

    return "any[]";
}

function getObjectTypeBySchemaObject(schema: SchemaObject, namespace?: string): string {
    const _interface = [`{`]
    if (schema.additionalProperties && !schema.properties)
        return schema.additionalProperties === true ? "unknown" : `Record<string, ${getTypeBySchemaObject(schema.additionalProperties, namespace)}>`

    if (schema.additionalProperties)
        _interface.push(`\t[key: string | number]: ${schema.additionalProperties === true ? "any" : getTypeBySchemaObject(schema.additionalProperties, namespace)}`)
    if (schema.properties)
        Object.entries(schema.properties).forEach(([name, property]) => {
            const required = schema.required?.includes(name) ?? false;
            _interface.push(`\t${formatFieldName(name)}${required ? "" : "?"}: ${getTypeBySchemaObject(property, namespace).split("\n").join("\n\t")}`)
        })
    _interface.push("}");
    return _interface.join("\n");
}
// TODO Add proper indentation
type JSDocEntry = { key: string, value: string }
function getJSDocBySchemaObject(schema: SchemaObject | ReferenceObject) {
    if ("$ref" in schema)
        return null;

    const entries: JSDocEntry[] = [];
    if (schema.format !== undefined)
        entries.push({ key: "@format", value: schema.format });
    // if (schema.default !== undefined)
    //     entries.push({ key: "@default", value: String(schema.default) });
    // if (schema.minimum !== undefined)
    //     entries.push({ key: "@min", value: schema.minimum.toString() });
    // if (schema.maximum !== undefined)
    //     entries.push({ key: "@max", value: schema.maximum.toString() });

    const lines = entries.length + (schema.description !== undefined ? 1 : 0);
    if (lines === 0)
        return null;

    if (lines === 1) {
        if (schema.description !== undefined)
            return schema.description !== "" ? `/** ${schema.description} */` : null;

        return `/** ${entries[0].key} ${entries[0].value} */`;
    }

    let jsdoc = "/**\n";
    if (schema.description && schema.description !== "")
        jsdoc += ` * ${schema.description}\n`;
    entries.forEach(entry => jsdoc += ` * ${entry.key} ${entry.value}\n`);
    jsdoc += " */";
    return jsdoc;
}