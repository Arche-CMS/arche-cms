import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { DatabaseAdapter } from "@altrugenix/database";
import { AccessControl } from "@altrugenix/permissions";
import type { Permission } from "@altrugenix/permissions";

export function registerRoleRoutes(fastify: FastifyInstance, adapter: DatabaseAdapter): void {
  const ac = new AccessControl(adapter);

  fastify.get(
    "/api/roles",
    { preHandler: [fastify.authenticate] },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const roles = await ac.getAllRoles();
      return reply.send({ data: roles, total: roles.length });
    },
  );

  fastify.get(
    "/api/roles/:id",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const role = await ac.getRoleById(id);
      if (!role) return reply.status(404).send({ error: "Role not found" });
      return reply.send(role);
    },
  );

  fastify.post(
    "/api/roles",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as {
        name: string;
        description: string;
        permissions: Array<{ action: string; resource: string }>;
      };
      try {
        const role = await ac.createRole(
          body.name,
          body.description,
          body.permissions as Permission[],
        );
        return reply.status(201).send(role);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create role";
        return reply.status(400).send({ error: message });
      }
    },
  );

  fastify.patch(
    "/api/roles/:id",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const body = request.body as {
        name?: string;
        description?: string;
        permissions?: Array<{ action: string; resource: string }>;
      };
      const role = await ac.updateRole(id, {
        ...body,
        permissions: body.permissions as Permission[] | undefined,
      });
      if (!role) return reply.status(404).send({ error: "Role not found" });
      return reply.send(role);
    },
  );

  fastify.delete(
    "/api/roles/:id",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const deleted = await ac.deleteRole(id);
      if (!deleted) return reply.status(404).send({ error: "Role not found" });
      return reply.send({ message: "Role deleted" });
    },
  );
}
