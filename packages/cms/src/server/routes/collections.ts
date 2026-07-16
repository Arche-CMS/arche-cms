import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { DatabaseAdapter } from "@arche-cms/database";
import type { CollectionDefinition, GlobalDefinition } from "@arche-cms/types";
import { createCollectionRouters } from "@arche-cms/rest-api";
import type { RouteHandlerContext } from "@arche-cms/rest-api";
import { createGlobalGetHandler, createGlobalUpsertHandler } from "@arche-cms/rest-api";
import { recordActivity } from "../lib/activity.js";

class BadSlugError extends Error {
  statusCode: number;
  constructor(msg: string) {
    super(msg);
    this.statusCode = 404;
  }
}

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

function resolveGlobal(slug: string, globals: GlobalDefinition[]): GlobalDefinition {
  const g = globals.find((g) => g.slug === slug);
  if (!g) throw new BadSlugError(`Unknown global: ${slug}`);
  return g;
}

function slugFromPath(path: string): string {
  const parts = path.split("/");
  return parts[2] ?? "";
}

function isMutation(method: string, path: string): boolean {
  if (method === "GET") return false;
  if (path.endsWith("/bulk-delete")) return true;
  return ["POST", "PATCH", "PUT", "DELETE"].includes(method);
}

function actionFor(method: string, path: string): string {
  if (path.endsWith("/bulk-delete")) return "bulkDelete";
  if (method === "POST") return "create";
  if (method === "PATCH") return "update";
  if (method === "DELETE") return "delete";
  if (method === "PUT") return "upsert";
  return "unknown";
}

function labelFromBody(body: unknown): string {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    return String(b.title ?? b.name ?? b.email ?? b.id ?? "");
  }
  return "";
}

function wrapWithActivity(
  handler: (ctx: RouteHandlerContext) => Promise<{ statusCode: number; body: unknown }>,
  method: string,
  path: string,
  adapter: DatabaseAdapter,
) {
  if (!isMutation(method, path)) return handler;
  return async (ctx: RouteHandlerContext) => {
    const result = await handler(ctx);
    if (result.statusCode >= 200 && result.statusCode < 300) {
      const body = result.body as Record<string, unknown> | undefined;
      recordActivity(adapter, {
        action: actionFor(method, path) as "create" | "update" | "delete" | "bulkDelete" | "upsert",
        collection: slugFromPath(path),
        documentId: body?.id != null ? String(body.id) : undefined,
        label: labelFromBody(body),
      }).catch(() => {});
    }
    return result;
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
    const handler = wrapWithActivity(routeDef.handler, routeDef.method, routeDef.path, adapter);
    void fastify.route({
      method: routeDef.method,
      url: routeDef.path,
      preHandler: [fastify.authenticate],
      handler: asHandler(handler),
    });
  }
}

export function registerGlobalRoutes(
  fastify: FastifyInstance,
  globals: GlobalDefinition[],
  adapter: DatabaseAdapter,
): void {
  const makeCtx = (request: FastifyRequest): RouteHandlerContext => ({
    params: request.params as Record<string, string>,
    query: request.query as Record<string, string | string[] | undefined>,
    body: request.body,
    headers: request.headers as Record<string, string>,
  });

  fastify.get(
    "/api/globals/:slug",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { slug } = request.params as { slug: string };
        const g = resolveGlobal(slug, globals);
        const result = await createGlobalGetHandler(g, adapter)(makeCtx(request));
        return reply.status(result.statusCode).send(result.body);
      } catch (error) {
        if (error instanceof BadSlugError) {
          return reply.status(error.statusCode).send({ error: error.message });
        }
        return reply.status(500).send({ error: "Internal server error" });
      }
    },
  );

  fastify.put(
    "/api/globals/:slug",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { slug } = request.params as { slug: string };
        const g = resolveGlobal(slug, globals);
        const handler = createGlobalUpsertHandler(g, adapter);
        const result = await handler(makeCtx(request));
        if (result.statusCode >= 200 && result.statusCode < 300) {
          const body = result.body as Record<string, unknown> | undefined;
          recordActivity(adapter, {
            action: "upsert",
            collection: slug,
            documentId: body?.id != null ? String(body.id) : undefined,
            label: body?.name != null ? String(body.name) : g.label,
          }).catch(() => {});
        }
        return reply.status(result.statusCode).send(result.body);
      } catch (error) {
        if (error instanceof BadSlugError) {
          return reply.status(error.statusCode).send({ error: error.message });
        }
        return reply.status(500).send({ error: "Internal server error" });
      }
    },
  );
}
