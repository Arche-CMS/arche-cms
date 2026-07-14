---
outline: deep
---

# Plugins

## Architecture

The plugin system follows a hook-and-extension architecture:

```
PluginManager
  ├── register(plugin)     — Register a plugin
  ├── unregister(name)     — Unregister a plugin
  ├── enable(name)/disable — Toggle plugins
  ├── runHook(name, ...)   — Execute hook callbacks
  │
  ├── Hooks:
  │   ├── beforeSchemaLoad
  │   ├── afterSchemaLoad
  │   ├── beforeRouteRegister
  │   ├── afterRouteRegister
  │   ├── beforeRequest
  │   └── afterRequest
  │
  └── Extension Points:
      ├── getCustomFields()    — Add fields to schemas
      └── getAdminPanels()     — Add admin UI panels
```

## Official Plugins

| Plugin        | Description                                      |
| ------------- | ------------------------------------------------ |
| **SEO**       | Meta fields, sitemap generation, Open Graph tags |
| **Audit Log** | Track all mutations with before/after snapshots  |
| **Webhooks**  | Trigger HTTP calls on content events             |
| **Search**    | Full-text search integration                     |
| **Comments**  | Comment fields with moderation support           |
| **Analytics** | Basic page view tracking dashboard               |

## Using Plugins

Plugins are auto-discovered from `node_modules` or registered explicitly:

```ts
import { createApp } from "./app.js";
import { seoPlugin } from "@arche-cms/plugins";

const app = await createApp({
  plugins: [seoPlugin({ siteUrl: "https://example.com" })],
});
```

## Writing a Plugin

```ts
import { definePlugin } from "@arche-cms/plugins";

export const myPlugin = definePlugin({
  name: "my-plugin",
  version: "1.0.0",
  description: "My custom plugin",

  hooks: {
    afterSchemaLoad(schemas) {
      // Modify or extend schemas
    },
    beforeRequest(ctx) {
      // Add request-level logic
    },
  },

  getCustomFields() {
    return [/* custom field definitions */];
  },
});
```
