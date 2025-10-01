import { HasagiClient } from "@hasagi/core";

const lcuClient = new HasagiClient();

async function getBasicHelpWithClientVersion(): Promise<{ clientVersion: string, types: string[], functions: string[], events: string[] }> {
    await lcuClient.connect({
        useWebSocket: false,
        authenticationStrategy: "process"
    });

    const [info, getHelpResult] = await Promise.all([
        lcuClient.request("get", "/system/v1/builds"),
        lcuClient.request("post", "/Help").then((res: any) => ({ types: Object.keys(res.types), functions: Object.keys(res.functions), events: Object.keys(res.events) })) as Promise<{ types: string[], functions: string[], events: string[] }>
    ]);

    return {
        clientVersion: info.version,
        types: getHelpResult.types,
        functions: getHelpResult.functions,
        events: getHelpResult.events
    }
}

export async function getLCUSchema() {
    const { clientVersion, types, functions, events } = await getBasicHelpWithClientVersion();
    const mappedTypes = await Promise.all(types.map(async (typeName) => {
        const mappedType = await lcuClient.request("post", "/Help", {
            query: {
                "target": typeName,
                "format": "Full"
            }
        }) as {
            name: string;
            values: {
                description: string;
                name: string;
                value: number;
            }[];
            fields: {
                description: string;
                name: string;
                offset: number;
                optional: boolean;
                type: {
                    elementType: string;
                    type: string;
                };
            }[];

            description: string;
            nameSpace: string;
            size: number;
            tags: string[];
        };

        return {
            name: mappedType.name,
            description: mappedType.description,
            tags: mappedType.tags,

            fields: mappedType.fields.map((field) => ({
                name: field.name,
                description: field.description,
                type: field.type,
                optional: field.optional
            })),

            values: mappedType.values.map((value) => ({
                name: value.name,
                description: value.description,
                value: value.value
            }))
        };
    }));

    const mappedFunctions = await Promise.all(functions.map(async (funcName) => {
        const fullFunc = await lcuClient.request("post", "/Help", {
            query: {
                "target": funcName,
                "format": "Full"
            }
        }) as any;

        const consoleFunc = await lcuClient.request("post", "/Help", {
            query: {
                "target": funcName,
                "format": "Console"
            }
        }) as any;

        const pathWithSlashOrNull = consoleFunc.url ? (consoleFunc.url.startsWith("/") ? consoleFunc.url : "/" + consoleFunc.url) : null;

        return {
            name: fullFunc.name,
            description: fullFunc.description,
            tags: fullFunc.tags,

            arguments: fullFunc.arguments,
            returns: fullFunc.returns,

            method: consoleFunc["http_method"] ?? null,
            path: pathWithSlashOrNull,
            pathParams: consoleFunc.url?.match(/{(.*?)}/g)?.map((str: string) => str.substring(1, str.length - 1)) ?? null,
        };
    }));

    const mappedEvents = await Promise.all(events.map(async (eventName) => {
        const ev = await lcuClient.request("post", "/Help", {
            query: {
                "target": eventName,
                "format": "Console"
            }
        }) as {
            description: string;
            name: string;
            nameSpace: string;
            tags: string[];
            type: {
                elementType: string;
                type: string;
            };
        };

        return {
            name: ev.name,
            description: ev.description,
            tags: ev.tags,
            type: ev.type
        };
    }));

    return {
        clientVersion,
        types: mappedTypes,
        functions: mappedFunctions,
        events: mappedEvents
    };
}

console.log(await getLCUSchema());