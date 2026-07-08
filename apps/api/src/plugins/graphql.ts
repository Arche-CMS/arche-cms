import type { FastifyInstance } from "fastify";
import mercurius from "mercurius";
import type { DatabaseAdapter } from "@altrugenix/database";
import type { CollectionDefinition } from "@altrugenix/types";
import { generateTypeDefs, generateResolvers } from "@altrugenix/graphql";

export async function registerGraphQL(
  fastify: FastifyInstance,
  collections: CollectionDefinition[],
  adapter: DatabaseAdapter,
): Promise<void> {
  const typeDefs = generateTypeDefs(collections);
  const resolvers = generateResolvers(collections, adapter);

  await fastify.register(mercurius, {
    schema: typeDefs,
    resolvers,
    graphiql: true,
  });
}
