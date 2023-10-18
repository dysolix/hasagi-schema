import axios from "axios";
import HasagiLiteClient from "@hasagi/core";
import { Type, Endpoint, Event, ExtendedHelp } from "./types.js";
import { OpenAPIObject, OperationObject, ParameterObject, ReferenceObject, RequestBodyObject, ResponseObject, SchemaObject, SecurityRequirementObject } from "./open-api-types.js";

function getRootType(input: Type): SchemaObject | ReferenceObject {
    const isObject = input.fields.length > 0;
    const isEnum = input.values.length > 0;

    const required: string[] = [];
    const properties: Record<string, SchemaObject | ReferenceObject> = {}
    input.fields.forEach(f => {
        if(properties[f.name] !== undefined) {
            console.log(`Duplicate field '${f.name}' in type '${input.name}'`)
            return;
        }

        properties[f.name] = getType(f)!;
        if(!f.optional)
            required.push(f.name)
    })

    return {
        type: isEnum ? "string" : "object",
        description: input.description,
        properties: isObject ? properties : undefined,
        enum: isEnum ? input.values.sort((v1, v2) => v2.value - v1.value).map(v => v.name) : undefined,
        additionalProperties: !isObject && !isEnum,
        required: required.length > 0 ? required : undefined
    }
}

function getType(input: { type: { elementType: string; type: string; }; } | string): SchemaObject | ReferenceObject | undefined {
    const type = typeof input === "string" ? input : input.type.type;

    switch (type) {
        case "string":
            return { type: "string" }
        case "uint8":
        case "uint16":
        case "uint32":
        case "uint64":
            return { type: "integer", format: type, minimum: 0 }
        case "int8":
        case "int16":
        case "int32":
        case "int64":
            return { type: "integer", format: type }
        case "bool":
            return { type: "boolean" }
        case "double":
        case "float":
            return { type: "number", format: type }
        case "vector":
            return { type: "array", items: getType((input as Type["fields"][number]).type.elementType) }
        case "map": {
            return { type: "object", additionalProperties: getType((input as Type["fields"][number]).type.elementType) }
        }
        case "object":
            return { type: "object", additionalProperties: true }
        case "":
            return undefined;
        default:
            return { $ref: `#/components/schemas/${type}` }
    }
}

export async function generateOpenAPIv3(schema: ExtendedHelp) {
    const client = new HasagiLiteClient();
    await client.connect();
    const region = await client.request({ method: "get", url: "/riotclient/region-locale" });
    const version: string = await axios.get(`https://ddragon.leagueoflegends.com/realms/${region.webRegion}.json`).then(res => res.data.v);

    const openAPISchema: OpenAPIObject = {
        openapi: "3.0.0",
        info: {
            title: "LCU SCHEMA",
            description: "Auto-generated using LCU's /help endpoint. Some endpoints are not included because their /help response is missing necessary fields.",
            version
        },
        components: { schemas: {} },
        paths: {}
    }

    let tags: string[] = [];
    schema.types.forEach(type => openAPISchema.components!.schemas![type.name] = getRootType(type));
    schema.functions.forEach(func => {
        if (func.method === null || func.path === null) {
            console.log(`Function '${func.name}' does not have a http method or path.`)
            return;
        }

        openAPISchema.paths[func.path] = openAPISchema.paths[func.path] ?? {}
        const operation = endpointToOperation(func, openAPISchema);
        tags.push(...operation.tags!.filter(tag => !tags.includes(tag)))
        // @ts-expect-error
        openAPISchema.paths[func.path][func.method.toLowerCase()] = operation;
    })

    openAPISchema.tags = tags.map(tag => {
        return {
            name: tag
        }
    }).sort((t1, t2) => {
        if (t1.name.includes("Plugin") && !t2.name.includes("Plugin"))
            return 1;

        if (!t1.name.includes("Plugin") && t2.name.includes("Plugin"))
            return -1;

        return t1.name.localeCompare(t2.name)
    })

    return openAPISchema;
}

function endpointToOperation(endpoint: Endpoint, schema: OpenAPIObject): OperationObject {
    let parameters: (ParameterObject | ReferenceObject)[] = undefined!;
    let response: ResponseObject = { description: "Success response" };
    let requestBody: RequestBodyObject = undefined!;

    if (endpoint.method === "GET" || endpoint.method === "DELETE" || endpoint.method === "HEAD" || endpoint.method === "OPTIONS" || endpoint.method === "TRACE") {
        parameters = endpoint.pathParams?.map(param => {
            const p = endpoint.arguments.find(arg => arg.name.replace("+", "") === param.replace("+", ""));

            return {
                in: "path",
                name: param,
                required: true,
                schema: p === undefined ? { type: "string" } : getType(p)
            }
        }) ?? [];

        const params: ParameterObject[] = endpoint.arguments.slice(parameters.length).flatMap(arg => {
            const type = getType(arg);
            if ("$ref" in type!) {
                const schemaObject = schema!.components!.schemas![type.$ref.split("/").at(-1)!] as SchemaObject;
                if (schemaObject.properties)
                    return Object.entries(schemaObject.properties).map(entry => {
                        return {
                            in: "query",
                            name: entry[0],
                            type: entry[1],
                        } as ParameterObject
                    })

                return {
                    in: "query",
                    schema: type,
                    name: arg.name
                } as ParameterObject
            } else {
                return {
                    in: "query",
                    required: !arg.optional,
                    name: arg.name,
                    schema: getType(arg)
                }
            }
        })

        parameters.push(...params);

        const returnType = getType({ type: endpoint.returns })
        response = { content: { "application/json": { schema: returnType } }, description: "Success response" }
    } else {
        parameters = endpoint.pathParams?.map(param => {
            const p = endpoint.arguments.find(arg => arg.name.replace("+", "") === param.replace("+", ""));

            return {
                in: "path",
                name: param,
                required: true,
                schema: p === undefined ? { type: "string" } : getType(p)
            }
        }) ?? [];

        const bodyType = endpoint.arguments.slice(parameters.length).at(0);
        if (bodyType)
            requestBody = {
                content: {
                    "application/json": {
                        schema: getType(bodyType)
                    }
                }
            }

        const returnType = getType({ type: endpoint.returns })
        response = returnType !== undefined ? { content: { "application/json": { schema: returnType } }, description: "Success response" } : { description: "Success response" }
    }

    const tags: string[] = [];
    if(endpoint.path?.startsWith("/lol-"))
        tags.push("Plugin " + endpoint.path.split("/")[1])
    else if(endpoint.path?.startsWith("/{plugin}"))
        tags.push("Plugin Asset Serving");
    else 
        tags.push(endpoint.path!.split("/")[1])

    const _tags = endpoint.tags;
    return {
        operationId: endpoint.name,
        description: endpoint.description,
        tags,
        parameters,
        requestBody,
        responses: {
            "2XX": response
        },
    } as OperationObject
}