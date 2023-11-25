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

