import { HasagiClient } from "@hasagi/core";
import fs from "fs/promises";

type Schema = { types: any[], functions: any[], events: any[] }

async function getExtendedHelp(includeRawData: true): Promise<{ extendedSchema: Schema; fullSchema: Schema; consoleSchema: Schema; }>
async function getExtendedHelp(includeRawData?: boolean): Promise<Schema | { extendedSchema: Schema; fullSchema: Schema; consoleSchema: Schema; }>
async function getExtendedHelp(includeRawData?: boolean): Promise<Schema | { extendedSchema: Schema; fullSchema: Schema; consoleSchema: Schema; }> {
    const client = new HasagiClient();
    await client.connect({
        useWebSocket: false,
        authenticationStrategy: "process"
    });

    const getHelpResult = await client.request({
        method: "get",
        url: "/help" as any
    }).then(res => res as { types: Record<string, any>, functions: Record<string, any>, events: Record<string, any> });

    const fullSchema: Schema = { events: [], functions: [], types: [] }
    const consoleSchema: Schema = { events: [], functions: [], types: [] }
    const extendedSchema: Schema = { events: [], functions: [], types: [] }

    for (const type in getHelpResult.types) {
        const fullType = await client.request({
            method: "post",
            url: "/help" as any,
            params: {
                "target": type,
                "format": "Full"
            }
        }).then(res => res as any);

        const consoleType = await client.request({
            method: "post",
            url: "/help" as any,
            params: {
                "target": type,
                "format": "Console"
            }
        }).then(res => res as any);

        fullSchema.types.push(fullType[0]);
        consoleSchema.types.push({ [type]: consoleType[type] });
        extendedSchema.types.push(fullType[0]);
    }

    for (const func in getHelpResult.functions) {
        const fullFunction = await client.request({
            method: "post",
            url: "/help" as any,
            params: {
                "target": func,
                "format": "Full"
            }
        }).then(res => res as any);

        const consoleFunction = await client.request({
            method: "post",
            url: "/help" as any,
            params: {
                "target": func,
                "format": "Console"
            }
        }).then(res => res as any);

        fullSchema.functions.push(fullFunction[0]);
        consoleSchema.functions.push({ [func]: consoleFunction[func] });
        extendedSchema.functions.push({
            ...fullFunction[0],
            method: consoleFunction[func]["http_method"] ?? null,
            path: consoleFunction[func].url ?? null,
            pathParams: consoleFunction[func].url?.match(/{(.*?)}/g)?.map((str: string) => str.substring(1, str.length - 1)) ?? null
        })
    }

    for (const event in getHelpResult.events) {
        const fullEvent = await client.request({
            method: "post",
            url: "/help" as any,
            params: {
                "target": event,
                "format": "Full"
            }
        }).then(res => res as any);

        const consoleEvent = await client.request({
            method: "post",
            url: "/help" as any,
            params: {
                "target": event,
                "format": "Console"
            }
        }).then(res => res as any);

        fullSchema.events.push(fullEvent[0]);
        consoleSchema.events.push({ [event]: consoleEvent[event] });
        extendedSchema.events.push(fullEvent[0]);
    }

    if (includeRawData)
        return {
            extendedSchema,
            fullSchema,
            consoleSchema
        }

    return extendedSchema;
}

export { getExtendedHelp };

/* if (outputRawData) {
    await fs.writeFile("./schema/data/fullSchema.json", JSON.stringify(fullSchema, null, 4));
    await fs.writeFile("./schema/data/consoleSchema.json", JSON.stringify(consoleSchema, null, 4));
    await fs.writeFile("./schema/dasta/extendedSchema.json", JSON.stringify(extendedSchema, null, 4));
} */