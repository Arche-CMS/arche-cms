export type { DatabaseAdapter, Migration, QueryOptions, ExistingSchema } from "./types.js";
export { SQLiteAdapter } from "./sqlite.js";
export type { PostgresAdapterOptions } from "./postgres.js";
export { MigrationRunner } from "./migration.js";
export { MigrationGenerator } from "./migration-generator.js";
export { Repository } from "./repository.js";

export async function createPostgresAdapter(
  options: import("./postgres.js").PostgresAdapterOptions,
): Promise<import("./postgres.js").PostgresAdapter> {
  const { PostgresAdapter } = await import("./postgres.js");
  return new PostgresAdapter(options);
}
