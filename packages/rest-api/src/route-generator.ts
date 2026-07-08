import type { DatabaseAdapter } from "@altrugenix/database";
import type { CollectionDefinition } from "@altrugenix/types";
import type { RouteDefinition, RouteGeneratorConfig, CollectionRouter } from "./types.js";
import {
  createListHandler,
  createGetHandler,
  createCreateHandler,
  createUpdateHandler,
  createDeleteHandler,
} from "./handlers.js";

function pascalCase(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function createCollectionRouter(
  collection: CollectionDefinition,
  adapter: DatabaseAdapter,
  config?: RouteGeneratorConfig,
): CollectionRouter {
  const basePath = config?.basePath ?? "/api";
  const maxPageSize = config?.maxPageSize ?? 100;
  const defaultPageSize = config?.defaultPageSize ?? 10;
  const plural = collection.labels.plural;
  const tag = collection.labels.singular;
  const slug = collection.slug;

  const routes: RouteDefinition[] = [
    {
      method: "GET",
      path: `${basePath}/${slug}`,
      operationId: `list${pascalCase(slug)}`,
      summary: `List ${plural}`,
      tags: [tag],
      handler: createListHandler(collection, adapter, maxPageSize, defaultPageSize),
    },
    {
      method: "GET",
      path: `${basePath}/${slug}/:id`,
      operationId: `get${pascalCase(slug)}`,
      summary: `Get a single ${tag}`,
      tags: [tag],
      handler: createGetHandler(collection, adapter),
    },
    {
      method: "POST",
      path: `${basePath}/${slug}`,
      operationId: `create${pascalCase(slug)}`,
      summary: `Create a ${tag}`,
      tags: [tag],
      handler: createCreateHandler(collection, adapter),
    },
    {
      method: "PATCH",
      path: `${basePath}/${slug}/:id`,
      operationId: `update${pascalCase(slug)}`,
      summary: `Update a ${tag}`,
      tags: [tag],
      handler: createUpdateHandler(collection, adapter),
    },
    {
      method: "DELETE",
      path: `${basePath}/${slug}/:id`,
      operationId: `delete${pascalCase(slug)}`,
      summary: `Delete a ${tag}`,
      tags: [tag],
      handler: createDeleteHandler(collection, adapter),
    },
  ];

  return { routes };
}

export function createCollectionRouters(
  collections: CollectionDefinition[],
  adapter: DatabaseAdapter,
  config?: RouteGeneratorConfig,
): CollectionRouter[] {
  return collections.map((c) => createCollectionRouter(c, adapter, config));
}
