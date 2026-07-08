/* eslint-disable no-console */

import { SchemaLoader, SchemaWatcher } from "@altrugenix/schema";
import type { SchemaChangeEvent } from "@altrugenix/schema";

export interface DevOptions {
  dir?: string;
  port?: number;
}

export function printDevHelp(): void {
  console.log(`
Usage: cms dev [options]

Start the CMS development server with file watching.

Options:
  --dir <path>   Schema directory (default: ./cms)
  --port <num>   Server port (default: 3000)
  --help         Show this help
`);
  process.exit(0);
}

export async function dev(options: DevOptions): Promise<void> {
  const schemaDir = options.dir ?? "cms";
  const port = options.port ?? 3000;

  console.log(`[cms] Starting dev server on port ${port}...`);
  console.log(`[cms] Loading schemas from ${schemaDir}/`);

  const loader = new SchemaLoader({ baseDir: schemaDir });
  const schemas = await loader.load();

  const collections = [...schemas.collections.values()];
  const globals = [...schemas.globals.values()];
  const components = [...schemas.components.values()];

  if (collections.length > 0) {
    console.log(`[cms]   Found ${collections.length} collection(s)`);
    for (const c of collections) {
      console.log(`[cms]     - ${c.slug}`);
    }
  }
  if (globals.length > 0) {
    console.log(`[cms]   Found ${globals.length} global(s)`);
  }
  if (components.length > 0) {
    console.log(`[cms]   Found ${components.length} component(s)`);
  }

  console.log(`[cms] Watching for schema changes in ${schemaDir}/...`);

  const watcher = new SchemaWatcher(schemaDir);
  watcher.on("change", (event: SchemaChangeEvent) => {
    console.log(`[cms] Schema changed: ${event.type} ${event.category}/${event.slug}`);
  });

  await watcher.start();

  console.log(`[cms] Dev server running at http://localhost:${port}`);
  console.log("[cms] Press Ctrl+C to stop");

  process.on("SIGINT", async () => {
    console.log("\n[cms] Shutting down...");
    await watcher.stop();
    process.exit(0);
  });

  await new Promise(() => {});
}
