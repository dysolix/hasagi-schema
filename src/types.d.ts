export interface Event {
    description: string;
    name: string;
    nameSpace: string;
    tags: string[];
    type: {
        elementType: string;
        type: string;
    };
}

export interface Endpoint {
    arguments: {
        name: string;
        optional: boolean;
        type: {
            elementType: string;
            type: string;
        };
        description: string;
    }[];
    async: string;
    description: string;
    help: string;
    name: string;
    nameSpace: string;
    returns: {
        elementType: string;
        type: string;
    };
    tags: string[];
    threadSafe: boolean;
    method: string | null;
    path: string | null;
    pathParams: string[] | null;
    overridden?: boolean;
}

interface Type {
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
}

interface ExtendedHelp { types: Type[], functions: Endpoint[], events: Event[] }

export namespace DataStructure {
    export type Type = Scalar | Object | Map | Array | Any

    export type Object = { [key: string]: Type | undefined }

    export type Scalar = String | Number | Boolean
    export type String = { type: "string", optional?: boolean }
    export type Number = { type: "number", format?: string, optional?: boolean }
    export type Boolean = { type: "boolean", optional?: boolean }

    export type Map = { type: "map", elementType: Type, optional?: boolean }
    export type Array = { type: "array", elementType: Type, optional?: boolean }

    export type Any = { type: "any", optional?: boolean }

    export type Ref = { type: "ref", resolvable: string }
}