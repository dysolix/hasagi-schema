import { getExtendedHelp } from "./get-extended-help.js";
import { generateOpenAPIv3 } from "./generate-openapi-v3.js";
import OpenAPISchema from "./openapi-schema.js";
import { ExtendedHelp } from "./types.js";
import { getType } from "./util.js";

async function getSwagger(xhelp: ExtendedHelp) {
    return new OpenAPISchema(await generateOpenAPIv3(xhelp))
}

async function getTypeScript(swagger: OpenAPISchema, xhelp: ExtendedHelp, namespace?: string) {
    const lcuTypes = namespace ? `export namespace ${namespace} {\n\t${swagger.getTypeScriptInterfaces(namespace).join("\n\n").split("\n").join("\n\t")}\n}` : swagger.getTypeScriptInterfaces().join("\n\n")

    const importNamespace = namespace ?? "LCUTypes";

    const lcuEndpoints = `${namespace ? `import { ${namespace} } from "./lcu-types";` : `import * as ${importNamespace} from "./lcu-types";`}\n\n${swagger.getEndpointInterfaces(namespace)}`
    const lcuEvents = `${namespace ? `import { ${namespace} } from "./lcu-types";` : `import * as LCUTypes from "./lcu-types";`}\n\nexport interface LCUWebSocketEvents {\n\t[key: string]: ${importNamespace}.PluginResourceEvent | ${importNamespace}.BindingCallbackEvent | ${importNamespace}.PluginLcdsEvent | ${importNamespace}.PluginRegionLocaleChangedEvent | ${importNamespace}.LogEvent | ${importNamespace}.PluginServiceProxyResponse\n\t${xhelp.events.filter((ev, i) => xhelp.events.findIndex(e => e.name === ev.name) === i).map(ev => `"${ev.name}": ${getType(ev.type, importNamespace)}`).join(",\n\t")}\n}`

    return {
        lcuTypes,
        lcuEndpoints,
        lcuEvents
    }
}

export { getExtendedHelp, getSwagger, getTypeScript }