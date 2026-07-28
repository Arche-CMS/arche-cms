import type { FastifyInstance } from "fastify";

import fastifyStatic from "@fastify/static";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);

/* v8 ignore start — findAdminDir depends on filesystem resolution, hard to test */
function findAdminDir(): string | null {
  const envDir = process.env.CMS_ADMIN_DIR;
  if (envDir && existsSync(envDir)) return envDir;

  // Admin UI dist lives inside the cms package at src/admin/dist/
  const serverDir = dirname(currentFile); // src/server/plugins/
  const cmsRoot = resolve(serverDir, "../../.."); // packages/cms/
  const adminDist = resolve(cmsRoot, "src/admin/dist");
  if (existsSync(resolve(adminDist, "index.html"))) {
    return adminDist;
  }

  // Legacy fallback: admin/ directory inside cms package
  const legacyDir = resolve(cmsRoot, "admin");
  if (existsSync(legacyDir) && existsSync(resolve(legacyDir, "index.html"))) {
    return legacyDir;
  }

  // Legacy fallback: dist/admin/ inside cms package
  const legacyDistDir = resolve(cmsRoot, "dist/admin");
  if (existsSync(legacyDistDir) && existsSync(resolve(legacyDistDir, "index.html"))) {
    return legacyDistDir;
  }

  return null;
}
/* v8 ignore stop */

export interface AdminStaticOptions {
  adminDir?: string | undefined;
}

export async function registerAdminStatic(
  fastify: FastifyInstance,
  options: AdminStaticOptions,
): Promise<void> {
  const adminDir = options.adminDir ?? findAdminDir();

  if (!adminDir) {
    fastify.log.warn(
      "Admin panel build not found. " +
        "The admin UI will not be available. " +
        "Build it with: pnpm --filter @arche-cms/cms build:admin " +
        "or set CMS_ADMIN_DIR env var.",
    );
    return;
  }

  fastify.log.info(`Serving admin panel from ${adminDir}`);

  await fastify.register(fastifyStatic, {
    prefix: "/",
    root: adminDir,
    wildcard: false,
  });

  fastify.setNotFoundHandler((_request, reply) => {
    void reply.sendFile("index.html");
  });
}
