import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export function registerErrorHandler(fastify: FastifyInstance): void {
  fastify.setErrorHandler(
    (error: Error & { statusCode?: number }, _request: FastifyRequest, reply: FastifyReply) => {
      const statusCode = error.statusCode ?? 500;
      const message = statusCode === 500 ? "Internal server error" : error.message;

      if (statusCode === 500) {
        fastify.log.error(error);
      }

      reply.status(statusCode).send({
        error: message,
        statusCode,
      });
    },
  );
}
