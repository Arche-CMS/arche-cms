import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { DatabaseAdapter } from "@altrugenix/database";
import type { StorageAdapter } from "@altrugenix/storage";

const MEDIA_TABLE = "__cms_media";

interface MediaRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  alt: string;
  createdAt: string;
  updatedAt: string;
}

async function ensureMediaTable(adapter: DatabaseAdapter): Promise<void> {
  await adapter.createTable(MEDIA_TABLE, {
    filename: "TEXT NOT NULL UNIQUE",
    originalName: "TEXT NOT NULL",
    mimeType: "TEXT NOT NULL",
    size: "INTEGER NOT NULL",
    alt: "TEXT NOT NULL DEFAULT ''",
    createdAt: "TEXT NOT NULL",
    updatedAt: "TEXT NOT NULL",
  });
}

export function registerMediaRoutes(
  fastify: FastifyInstance,
  adapter: DatabaseAdapter,
  storage: StorageAdapter,
): void {
  let initialized = false;

  async function init(): Promise<void> {
    if (!initialized) {
      await ensureMediaTable(adapter);
      initialized = true;
    }
  }

  fastify.get(
    "/api/media",
    { preHandler: [fastify.authenticate] },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      await init();
      const results = await adapter.findMany(MEDIA_TABLE, { sort: { createdAt: "desc" } });
      return reply.send({ data: results.data, total: results.total });
    },
  );

  fastify.get(
    "/api/media/:id",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      await init();
      const { id } = request.params as { id: string };
      const record = await adapter.findOne(MEDIA_TABLE, id);
      if (!record) return reply.status(404).send({ error: "Media not found" });
      return reply.send(record);
    },
  );

  fastify.post(
    "/api/media",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      await init();
      const body = request.body as {
        fileName?: string;
        mimeType?: string;
        data?: string;
        alt?: string;
      };

      if (!body.fileName || !body.mimeType || !body.data) {
        return reply.status(400).send({ error: "fileName, mimeType, and data are required" });
      }

      const buffer = Buffer.from(body.data, "base64");
      if (buffer.length === 0) {
        return reply.status(400).send({ error: "Invalid base64 data" });
      }

      const ext = body.fileName.includes(".") ? body.fileName.split(".").pop() : "";
      const uniqueName = `${randomUUID()}${ext ? `.${ext}` : ""}`;
      const filePath = `media/${uniqueName}`;

      await storage.save(filePath, buffer, body.mimeType);

      const now = new Date().toISOString();
      const record = await adapter.create(MEDIA_TABLE, {
        filename: filePath,
        originalName: body.fileName,
        mimeType: body.mimeType,
        size: buffer.length,
        alt: body.alt ?? "",
        createdAt: now,
        updatedAt: now,
      });

      return reply.status(201).send(record);
    },
  );

  fastify.patch(
    "/api/media/:id",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      await init();
      const { id } = request.params as { id: string };
      const body = request.body as { originalName?: string; alt?: string };
      const record = await adapter.findOne(MEDIA_TABLE, id);
      if (!record) return reply.status(404).send({ error: "Media not found" });

      const updates: Record<string, string> = {};
      if (body.originalName !== undefined) updates.originalName = body.originalName;
      if (body.alt !== undefined) updates.alt = body.alt;
      updates.updatedAt = new Date().toISOString();

      const updated = await adapter.update(MEDIA_TABLE, id, updates);
      return reply.send(updated);
    },
  );

  fastify.delete(
    "/api/media/:id",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      await init();
      const { id } = request.params as { id: string };
      const record = await adapter.findOne(MEDIA_TABLE, id);
      if (!record) return reply.status(404).send({ error: "Media not found" });

      const typed = record as unknown as MediaRecord;
      await storage.delete(typed.filename);
      await adapter.delete(MEDIA_TABLE, id);

      return reply.send({ message: "Media deleted" });
    },
  );

  fastify.get(
    "/api/media/file/:id",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      await init();
      const { id } = request.params as { id: string };
      const record = await adapter.findOne(MEDIA_TABLE, id);
      if (!record) return reply.status(404).send({ error: "Media not found" });

      const typed = record as unknown as MediaRecord;
      const exists = await storage.exists(typed.filename);
      if (!exists) return reply.status(404).send({ error: "File not found on disk" });

      const stream = await storage.getStream(typed.filename);
      reply.type(typed.mimeType);
      reply.header("Content-Disposition", `inline; filename="${typed.originalName}"`);
      reply.header("Content-Length", String(typed.size));
      return reply.send(stream);
    },
  );
}
