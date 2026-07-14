import type { FastifyInstance } from "fastify";

export function registerRequestLogger(fastify: FastifyInstance): void {
  fastify.addHook("onResponse", (request, reply, done) => {
    fastify.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime,
      },
      "request completed",
    );
    done();
  });
}
