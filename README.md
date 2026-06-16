# @hasagi/schema

The schema / type-generation toolkit behind Hasagi. It reads the League of Legends client's own API
description (the LCU "help" schema, exposed by a running client), builds an OpenAPI v3 (swagger)
document from it, and generates the TypeScript definitions that power typed LCU requests and events.

This is the engine used by the [`@hasagi/cli`](https://www.npmjs.com/package/@hasagi/cli) `schema`
command and the generated types shipped in
[`@hasagi/core/types`](https://www.npmjs.com/package/@hasagi/core) and
[`@hasagi/types`](https://www.npmjs.com/package/@hasagi/types).

> Most users don't need this package directly — use `hasagi schema` (from `@hasagi/cli`) to generate
> types, or just consume the pre-generated types. Use `@hasagi/schema` only if you're building your
> own generation pipeline.

## Installation

```bash
npm install @hasagi/schema
```

## API

```ts
import { getExtendedHelp, getSwagger, getTypeScript } from "@hasagi/schema";

// 1. Fetch and normalize the LCU help schema (requires a running League client).
const xhelp = await getExtendedHelp();

// 2. Build an OpenAPI v3 (swagger) document.
const swagger = await getSwagger(xhelp);

// 3. Generate the TypeScript definitions.
const { lcuTypes, lcuEndpoints, lcuEvents } = await getTypeScript(swagger, xhelp /*, namespace? */);
```

- **`getExtendedHelp()`** — retrieves and normalizes the LCU's API description from a running client.
- **`getSwagger(xhelp)`** — produces an OpenAPI v3 schema object (with helpers for generating types).
- **`getTypeScript(swagger, xhelp, namespace?)`** — returns the generated `lcuTypes`, `lcuEndpoints`
  and `lcuEvents` source strings. Pass a `namespace` to wrap the generated types.

## Disclaimer

Hasagi is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or
anyone officially involved in producing or managing Riot Games properties. Riot Games and all
associated properties are trademarks or registered trademarks of Riot Games, Inc.
