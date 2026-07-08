import type { FastifyInstance } from "fastify";

export function registerHealth(fastify: FastifyInstance): void {
  fastify.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });
}
