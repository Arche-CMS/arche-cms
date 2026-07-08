import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import type { DatabaseAdapter, CollectionDefinition } from "@altrugenix/types";
import { createApp } from "../src/app.js";
import type { ServerConfig } from "../src/config.js";

const mockAdapter = {
  findOne: async (_table: string, id: string) => {
    if (id === "1") return { id: "1", title: "Hello", body: "World" };
    return null;
  },
  findMany: async () => ({ data: [{ id: "1", title: "Hello", body: "World" }], total: 1 }),
  create: async (_table: string, data: Record<string, unknown>) => ({
    id: "1",
    title: "New",
    ...data,
  }),
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
    expect(body.total).toBe(1);
  });

  it("serves collection get endpoint", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/posts/1",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.title).toBe("Hello");
  });

  it("serves collection create endpoint", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/posts",
      body: { title: "New Post", body: "Content" },
    });
    expect(res.statusCode).toBe(201);
  });

  it("serves collection update endpoint", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/posts/1",
      body: { title: "Updated", body: "Content" },
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

  describe("GraphQL endpoint", () => {
    it("serves GraphiQL at /graphiql", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/graphiql",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toContain("graphiql");
    });

    it("executes listPosts query", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/graphql",
        body: { query: "{ listPosts { id title } }" },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data).toBeDefined();
      expect(body.data.listPosts).toHaveLength(1);
      expect(body.data.listPosts[0].id).toBe("1");
    });

    it("executes posts query by id", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/graphql",
        body: { query: '{ posts(id: "1") { id title } }' },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data.posts).toBeDefined();
      expect(body.data.posts.id).toBe("1");
    });

    it("executes createPosts mutation", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/graphql",
        body: { query: 'mutation { createPosts(data: { title: "New" }) { id title } }' },
      });
      const body = JSON.parse(res.body);
      expect(body.data).toBeDefined();
      expect(body.errors).toBeUndefined();
    });

    it("executes updatePosts mutation", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/graphql",
        body: {
          query: 'mutation { updatePosts(id: "1", data: { title: "Updated" }) { id title } }',
        },
      });
      const body = JSON.parse(res.body);
      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toContain("Not found");
    });

    it("executes deletePosts mutation", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/graphql",
        body: { query: 'mutation { deletePosts(id: "1") }' },
      });
      const body = JSON.parse(res.body);
      expect(body.data?.deletePosts).toBe(true);
    });
  });
});
