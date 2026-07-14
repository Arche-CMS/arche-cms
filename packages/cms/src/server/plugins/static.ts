import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";

const currentDir = dirname(fileURLToPath(import.meta.url));
const bundledAdminDir = resolve(currentDir, "../../../admin");

export interface AdminStaticOptions {
  adminDir?: string;
}

export async function registerAdminStatic(
  fastify: FastifyInstance,
  options: AdminStaticOptions,
): Promise<void> {
  const adminDir = options.adminDir ?? process.env.CMS_ADMIN_DIR ?? bundledAdminDir;

  if (!existsSync(adminDir)) {
    fastify.log.warn(
      `Admin panel build not found at ${adminDir}. ` +
        "The admin UI will not be available in production mode. " +
        "Set CMS_ADMIN_DIR env var or run the admin Vite dev server on port 5173 for development.",
    );
    return;
  }

  fastify.log.info(`Serving admin panel from ${adminDir}`);

  await fastify.register(fastifyStatic, {
    root: adminDir,
    prefix: "/",
    wildcard: false,
  });

  fastify.setNotFoundHandler((_request, reply) => {
    void reply.sendFile("index.html");
  });
}
