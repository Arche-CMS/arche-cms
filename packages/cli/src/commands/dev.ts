/* eslint-disable no-console */

import { existsSync, writeFileSync } from "node:fs";
import { SchemaLoader, SchemaWatcher } from "@altrugenix/schema";
import type { SchemaChangeEvent } from "@altrugenix/schema";
import { SQLiteAdapter, PostgresAdapter } from "@altrugenix/database";
import { LocalStorageAdapter } from "@altrugenix/storage";
import { PluginManager, seoPlugin, discoverPlugins } from "@altrugenix/plugins";
import { EventBus, Lifecycle, createLogger } from "@altrugenix/core";
import { loadConfig } from "../server/config.js";
import { createApp } from "../server/app.js";
import { createScheduledPublisher } from "../server/services/scheduled-publisher.js";
import { registerAdminStatic } from "../server/plugins/static.js";

export interface DevOptions {
  dir?: string;
  port?: number;
  host?: string;
  dbUrl?: string;
  dbAdapter?: string;
}

export function printDevHelp(): void {
  console.log(`
Usage: cms dev [options]

Start the CMS development server with file watching.

Options:
  --dir <path>       Schema directory (default: ./cms)
  --port <num>       Server port (default: 3000)
  --host <addr>      Server host (default: 0.0.0.0)
  --db-url <url>     Database URL (default: file:./cms.db)
  --db-adapter <type> Database adapter: sqlite | postgres (default: sqlite)
  --help             Show this help
`);
  process.exit(0);
}

function resolveDbPath(dbUrl: string): string {
  if (dbUrl.startsWith("file:")) {
    const path = dbUrl.slice(5);
    return path || ":memory:";
  }
  return dbUrl;
}

export async function dev(options: DevOptions): Promise<void> {
  const logger = createLogger({ level: "info", prefix: "cms" });

  // Set ephemeral dev secret for local development
  if (!process.env.AUTH_SECRET) {
    logger.warn(
      "AUTH_SECRET not set — using ephemeral dev secret. Generate one with: openssl rand -hex 32",
    );
    process.env.AUTH_SECRET = "dev-secret-do-not-use-in-production";
  }

  // Override env vars with CLI flags for loadConfig
  if (options.port) process.env.PORT = String(options.port);
  if (options.host) process.env.HOST = options.host;
  if (options.dir) process.env.SCHEMA_DIR = options.dir;
  if (options.dbUrl) process.env.DB_URL = options.dbUrl;
  if (options.dbAdapter) process.env.DB_ADAPTER = options.dbAdapter;

  const config = loadConfig();
  const schemaDir = config.schema.baseDir;
  const port = config.port;
  const host = config.host;

  // Auto-create SQLite database file
  if (config.database.adapter === "sqlite") {
    const dbPath = resolveDbPath(config.database.url);
    if (dbPath !== ":memory:" && !existsSync(dbPath)) {
      logger.info(`Creating SQLite database at ${dbPath}`);
      writeFileSync(dbPath, "");
    }
  }

  // Create database adapter
  const adapter =
    config.database.adapter === "postgres"
      ? new PostgresAdapter({ connectionString: config.database.url })
      : new SQLiteAdapter(config.database.url);

  // Core services
  const eventBus = new EventBus();
  const lifecycle = new Lifecycle();
  const pluginManager = new PluginManager({
    eventBus,
    lifecycle,
    context: {
      config: config as never,
      logger,
      container: {},
    },
  });

  // Register built-in plugins
  pluginManager.register(seoPlugin);

  // Discover and register plugins from node_modules
  const discovered = await discoverPlugins();
  for (const plugin of discovered) {
    pluginManager.register(plugin.definition);
  }

  // Schema loader with plugin hooks
  const schemaLoader = new SchemaLoader({
    baseDir: schemaDir,
    onBeforeLoad: () => pluginManager.runHook("beforeSchemaLoad"),
    onAfterLoad: async () => {
      await pluginManager.runHook("afterSchemaLoad");
    },
  });

  try {
    await adapter.connect();
    await adapter.raw("SELECT 1");
    logger.info("Database connection verified");

    const schemas = await schemaLoader.load();
    const collections = Array.from(schemas.collections.values());
    const globals = Array.from(schemas.globals.values());
    const components = Array.from(schemas.components.values());

    logger.info(
      `Loaded ${collections.length} collection(s), ${globals.length} global(s), ${components.length} component(s)`,
    );

    const storageAdapter = new LocalStorageAdapter(process.env.STORAGE_DIR || "./uploads");

    const fastify = await createApp({
      config,
      adapter,
      storageAdapter,
      collections,
      globals,
      pluginManager: {
        runHook: (name) => pluginManager.runRouteHook(name),
        getCustomFields: () => pluginManager.getCustomFields(),
        getAdminPanels: () => pluginManager.getAdminPanels(),
      },
    });

    // Start scheduled publisher for publish-at dates
    const publisher = createScheduledPublisher(adapter, collections);
    fastify.addHook("onClose", () => publisher.stop());

    // Serve admin panel static files if available
    await registerAdminStatic(fastify, {
      adminDir: options.dir ? undefined : undefined,
    });

    // Start server
    await fastify.listen({ port, host });
    logger.info(`Server listening on http://${host}:${port}`);
    logger.info(`API docs at http://localhost:${port}/docs`);

    // Watch for schema changes
    logger.info(`Watching for schema changes in ${schemaDir}/...`);
    const watcher = new SchemaWatcher(schemaDir);
    watcher.on("change", (event: SchemaChangeEvent) => {
      logger.info(`Schema changed: ${event.type} ${event.category}/${event.slug}`);
    });
    await watcher.start();

    process.on("SIGINT", async () => {
      logger.info("Shutting down...");
      await watcher.stop();
      await fastify.close();
      await adapter.disconnect();
      process.exit(0);
    });
  } catch (err) {
    logger.error("Failed to start server:", err instanceof Error ? err.message : String(err));
    await adapter.disconnect().catch(() => {});
    process.exit(1);
  }
}
