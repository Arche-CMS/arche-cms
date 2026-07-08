export type {
  RouteHandlerContext,
  RouteHandlerResult,
  RouteHandler,
  RouteDefinition,
  CollectionRouter,
  RouteGeneratorConfig,
  CreateCollectionRouter,
} from "./types.js";

export { createCollectionRouter, createCollectionRouters } from "./route-generator.js";

export {
  createListHandler,
  createGetHandler,
  createCreateHandler,
  createUpdateHandler,
  createDeleteHandler,
} from "./handlers.js";

export { generateOpenApiSpec } from "./openapi.js";
export type { OpenApiOptions } from "./openapi.js";

export { registerRoutes } from "./register.js";
export type { RouterAdapter } from "./register.js";
