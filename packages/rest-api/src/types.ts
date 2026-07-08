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
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  operationId: string;
  summary: string;
  tags: string[];
  handler: RouteHandler;
}

export interface CollectionRouter {
  routes: RouteDefinition[];
}

export type BeforeHook = (
  context: RouteHandlerContext,
  collection?: CollectionDefinition,
) => Promise<RouteHandlerResult | undefined>;

export type AfterHook = (
  context: RouteHandlerContext,
  result: RouteHandlerResult,
  collection?: CollectionDefinition,
) => Promise<RouteHandlerResult>;

export interface MiddlewareHooks {
  before?: BeforeHook[];
  after?: AfterHook[];
}

export interface RouteGeneratorConfig {
  basePath?: string;
  maxPageSize?: number;
  defaultPageSize?: number;
  hooks?: MiddlewareHooks;
}

export type CreateCollectionRouter = (
  collection: CollectionDefinition,
  adapter: DatabaseAdapter,
  config?: RouteGeneratorConfig,
) => CollectionRouter;
