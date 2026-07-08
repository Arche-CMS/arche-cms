/* eslint-disable no-console */

import { loadConfig } from "./config.js";
import { createApp } from "./app.js";
import { SchemaLoader } from "@altrugenix/schema";
import { SQLiteAdapter } from "@altrugenix/database";

async function main(): Promise<void> {
  const config = loadConfig();

  const adapter = new SQLiteAdapter(config.database.url);

  const schemaLoader = new SchemaLoader({ baseDir: config.schema.baseDir });

  try {
    await adapter.connect();
    const schemas = await schemaLoader.load();
    const collections = Array.from(schemas.collections.values());
    const fastify = await createApp({ config, adapter, collections });

    await fastify.listen({ port: config.port, host: config.host });
    console.log(`Server listening on http://${config.host}:${config.port}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    await adapter.disconnect().catch(() => {});
    process.exit(1);
  }
}

main();
