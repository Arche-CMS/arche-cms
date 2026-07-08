import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import type { DatabaseAdapter, CollectionDefinition } from "@altrugenix/types";
import { createApp } from "../src/app.js";
import type { ServerConfig } from "../src/config.js";

const mockAdapter = {
  findOne: async () => null,
  findMany: async () => ({ data: [], total: 0 }),
  create: async () => ({}),
  update: async () => null,
  delete: async () => true,
  connect: async () => {},
  disconnect: async () => {},
  transaction: async <T>(fn: () => Promise<T>) => fn(),
  raw: async () => [],
  createTable: async () => {},
  dropTable: async () => {},
  runMigration: async () => {},
  getExecutedMigrations: async () => [],
} satisfies DatabaseAdapter;

const collection: CollectionDefinition = {
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  fields: [
    { name: "title", type: "text", validation: { required: true } },
    { name: "body", type: "richText" },
  ],
};

const testConfig: ServerConfig = {
  port: 0,
  host: "localhost",
  logger: { level: "silent" },
  cors: { origin: "*" },
  rateLimit: { max: 1000, timeWindow: "1 minute" },
  swagger: {
    title: "Test API",
    version: "1.0.0",
    description: "Test",
  },
  schema: { baseDir: "./cms" },
  database: { adapter: "sqlite", url: ":memory:" },
};

describe("CMS API Server", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp({
      config: testConfig,
      adapter: mockAdapter,
      collections: [collection],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("health endpoint returns ok", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeGreaterThan(0);
  });

  it("Swagger UI is served at /docs", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/docs",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("swagger");
  });

  it("serves collection list endpoint", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/posts",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data).toBeDefined();
    expect(body.total).toBe(0);
  });

  it("serves collection get endpoint", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/posts/1",
    });
    expect(res.statusCode).toBe(404);
  });

  it("serves collection create endpoint", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/posts",
      body: { title: "New Post" },
    });
    expect(res.statusCode).toBe(201);
  });

  it("serves collection update endpoint", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/posts/1",
      body: { title: "Updated" },
    });
    expect(res.statusCode).toBe(404);
  });

  it("serves collection delete endpoint", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: "/api/posts/1",
    });
    expect(res.statusCode).toBe(200);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/unknown",
    });
    expect(res.statusCode).toBe(404);
  });

  it("handles validation for missing body on POST", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/posts",
      body: null,
    });
    expect(res.statusCode).toBe(400);
  });
});
