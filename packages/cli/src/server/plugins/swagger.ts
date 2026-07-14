import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export interface SwaggerOptions {
  title: string;
  version: string;
  description: string;
}

export async function registerSwagger(
  fastify: FastifyInstance,
  options: SwaggerOptions,
): Promise<void> {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: options.title,
        version: options.version,
        description: options.description,
      },
      components: {},
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/docs",
  });
}
