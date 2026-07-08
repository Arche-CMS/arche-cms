import type { DatabaseAdapter } from "@altrugenix/database";
import type { CollectionDefinition } from "@altrugenix/types";

export interface RouteHandlerContext {
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  headers: Record<string, string>;
}

export interface RouteHandlerResult {
  statusCode: number;
  body: unknown;
  headers?: Record<string, string>;
}

export type RouteHandler = (context: RouteHandlerContext) => Promise<RouteHandlerResult>;

export interface RouteDefinition {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  operationId: string;
  summary: string;
  tags: string[];
  handler: RouteHandler;
}

export interface CollectionRouter {
  routes: RouteDefinition[];
}

export interface RouteGeneratorConfig {
  basePath?: string;
  maxPageSize?: number;
  defaultPageSize?: number;
}

export type CreateCollectionRouter = (
  collection: CollectionDefinition,
  adapter: DatabaseAdapter,
  config?: RouteGeneratorConfig,
) => CollectionRouter;
