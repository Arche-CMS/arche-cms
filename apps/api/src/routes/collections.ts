import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { DatabaseAdapter } from "@altrugenix/database";
import type { CollectionDefinition, GlobalDefinition } from "@altrugenix/types";
import { createCollectionRouters, createGlobalRouters } from "@altrugenix/rest-api";
import type { RouteHandlerContext } from "@altrugenix/rest-api";

function asHandler(
  handler: (ctx: RouteHandlerContext) => Promise<{ statusCode: number; body: unknown }>,
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await handler({
      params: request.params as Record<string, string>,
      query: request.query as Record<string, string | string[] | undefined>,
      body: request.body,
      headers: request.headers as Record<string, string>,
    });
    return reply.status(result.statusCode).send(result.body);
  };
}

export function registerCollectionRoutes(
  fastify: FastifyInstance,
  collections: CollectionDefinition[],
  adapter: DatabaseAdapter,
): void {
  const routers = createCollectionRouters(collections, adapter);
  const allRoutes = routers.flatMap((r) => r.routes);

  for (const routeDef of allRoutes) {
    void fastify.route({
      method: routeDef.method,
      url: routeDef.path,
      handler: asHandler(routeDef.handler),
    });
  }
}

export function registerGlobalRoutes(
  fastify: FastifyInstance,
  globals: GlobalDefinition[],
  adapter: DatabaseAdapter,
): void {
  const routers = createGlobalRouters(globals, adapter);
  const allRoutes = routers.flatMap((r) => r.routes);

  for (const routeDef of allRoutes) {
    void fastify.route({
      method: routeDef.method,
      url: routeDef.path,
      handler: asHandler(routeDef.handler),
    });
  }
}
