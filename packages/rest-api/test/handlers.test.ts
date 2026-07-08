import { describe, it, expect } from "vitest";
import type { CollectionDefinition, DatabaseAdapter, QueryOptions } from "@altrugenix/database";
import {
  createListHandler,
  createGetHandler,
  createCreateHandler,
  createUpdateHandler,
  createDeleteHandler,
  createBulkDeleteHandler,
} from "../src/handlers.js";

const posts: Record<string, unknown>[] = [
  { id: 1, title: "Hello", body: "World", author: "user-1" },
  { id: 2, title: "Second", body: "Post", author: "user-2" },
];

const users: Record<string, unknown>[] = [
  { id: "user-1", name: "Alice" },
  { id: "user-2", name: "Bob" },
];

function createMockAdapter(): DatabaseAdapter {
  let nextId = 3;
  const store = [...posts];

  return {
    findOne: async (collection: string, id: string, options?: QueryOptions) => {
      if (collection === "__cms_users") {
        return users.find((u) => u.id === id) ?? null;
      }
      const record = store.find((p) => String(p.id) === id);
      if (record && options?.select) {
        const selected: Record<string, unknown> = {};
        for (const field of options.select) {
          if (field in record) selected[field] = record[field];
        }
        return Object.keys(selected).length > 0 ? selected : record;
      }
      return record ?? null;
    },
    findMany: async (_collection: string, options?: QueryOptions) => {
      let data = [...store];
      if (options?.where) {
        const entries = Object.entries(options.where);
        for (const [key, value] of entries) {
          if (Array.isArray(value)) {
            data = data.filter((r) => value.includes(String(r[key])));
          } else {
            data = data.filter((r) => r[key] === value);
          }
        }
      }
      const total = data.length;
      if (options?.sort) {
        for (const [field, dir] of Object.entries(options.sort)) {
          data.sort((a, b) => {
            const va = String(a[field] ?? "");
            const vb = String(b[field] ?? "");
            return dir === "desc" ? vb.localeCompare(va) : va.localeCompare(vb);
          });
        }
      }
      if (options?.offset) data = data.slice(options.offset);
      if (options?.limit) data = data.slice(0, options.limit);
      const selectFields = options?.select as string[] | undefined;
      if (selectFields) {
        data = data.map((r) => {
          const selected: Record<string, unknown> = {};
          for (const field of selectFields) {
            if (field in r) selected[field] = r[field];
          }
          return selected;
        });
      }
      return { data, total };
    },
    create: async (_collection: string, data: Record<string, unknown>) => {
      const record = { id: nextId++, ...data };
      store.push(record);
      return record;
    },
    update: async (_collection: string, id: string, data: Record<string, unknown>) => {
      const idx = store.findIndex((p) => String(p.id) === id);
      if (idx === -1) return null;
      store[idx] = { ...store[idx], ...data };
      return store[idx] as Record<string, unknown>;
    },
    delete: async (_collection: string, id: string) => {
      const idx = store.findIndex((p) => String(p.id) === id);
      if (idx === -1) return false;
      store.splice(idx, 1);
      return true;
    },
    deleteMany: async (_collection: string, ids: string[]) => {
      let count = 0;
      for (const id of ids) {
        const idx = store.findIndex((p) => String(p.id) === id);
        if (idx !== -1) {
          store.splice(idx, 1);
          count++;
        }
      }
      return count;
    },
    connect: async () => {},
    disconnect: async () => {},
    transaction: async <T>(fn: () => Promise<T>) => fn(),
    raw: async () => [],
    createTable: async () => {},
    dropTable: async () => {},
    runMigration: async () => {},
    getExecutedMigrations: async () => [],
  };
}

const collection: CollectionDefinition = {
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  fields: [
    { name: "title", type: "text", validation: { required: true } },
    { name: "body", type: "richText" },
    { name: "author", type: "relation", to: "users" },
  ],
};

describe("CRUD handlers", () => {
  it("listHandler returns paginated results", async () => {
    const adapter = createMockAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({
      params: {},
      query: {},
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(200);
    const body = result.body as { data: unknown[]; total: number };
    expect(body.data).toHaveLength(2);
    expect(body.total).toBe(2);
  });

  it("listHandler respects limit and offset", async () => {
    const adapter = createMockAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({
      params: {},
      query: { limit: "1", offset: "1" },
      body: null,
      headers: {},
    });
    const body = result.body as { data: unknown[]; total: number };
    expect(body.data).toHaveLength(1);
    expect(body.total).toBe(2);
  });

  it("listHandler respects sort", async () => {
    const adapter = createMockAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({
      params: {},
      query: { sort: "title:desc" },
      body: null,
      headers: {},
    });
    const body = result.body as { data: { title: string }[] };
    expect((body.data[0] as { title: string }).title).toBe("Second");
  });

  it("listHandler respects field selection", async () => {
    const adapter = createMockAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({
      params: {},
      query: { select: "title" },
      body: null,
      headers: {},
    });
    const body = result.body as { data: Record<string, unknown>[] };
    expect(body.data[0]).toEqual({ title: "Hello" });
  });

  it("listHandler respects where filter", async () => {
    const adapter = createMockAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({
      params: {},
      query: { "where[title]": "Hello" },
      body: null,
      headers: {},
    });
    const body = result.body as { data: unknown[]; total: number };
    expect(body.data).toHaveLength(1);
    expect(body.total).toBe(1);
  });

  it("listHandler populates relations", async () => {
    const adapter = createMockAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({
      params: {},
      query: { populate: "author" },
      body: null,
      headers: {},
    });
    const body = result.body as { data: Record<string, unknown>[] };
    expect((body.data[0] as Record<string, unknown>).author).toEqual({
      id: "user-1",
      name: "Alice",
    });
  });

  it("getHandler returns a single record", async () => {
    const adapter = createMockAdapter();
    const handler = createGetHandler(collection, adapter);
    const result = await handler({
      params: { id: "1" },
      query: {},
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(200);
    const body = result.body as Record<string, unknown>;
    expect(body.title).toBe("Hello");
  });

  it("getHandler returns 404 for missing record", async () => {
    const adapter = createMockAdapter();
    const handler = createGetHandler(collection, adapter);
    const result = await handler({
      params: { id: "999" },
      query: {},
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(404);
  });

  it("getHandler returns 400 for missing id", async () => {
    const adapter = createMockAdapter();
    const handler = createGetHandler(collection, adapter);
    const result = await handler({
      params: {},
      query: {},
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(400);
  });

  it("getHandler populates relations", async () => {
    const adapter = createMockAdapter();
    const handler = createGetHandler(collection, adapter);
    const result = await handler({
      params: { id: "1" },
      query: { populate: "author" },
      body: null,
      headers: {},
    });
    const body = result.body as Record<string, unknown>;
    expect(body.author).toEqual({ id: "user-1", name: "Alice" });
  });

  it("createHandler creates a record", async () => {
    const adapter = createMockAdapter();
    const handler = createCreateHandler(collection, adapter);
    const result = await handler({
      params: {},
      query: {},
      body: { title: "New Post", body: "Content" },
      headers: {},
    });
    expect(result.statusCode).toBe(201);
    const body = result.body as Record<string, unknown>;
    expect(body.title).toBe("New Post");
    expect(body.id).toBe(3);
  });

  it("createHandler returns 400 for missing body", async () => {
    const adapter = createMockAdapter();
    const handler = createCreateHandler(collection, adapter);
    const result = await handler({
      params: {},
      query: {},
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(400);
  });

  it("createHandler returns 400 for validation failure", async () => {
    const adapter = createMockAdapter();
    const handler = createCreateHandler(collection, adapter);
    const result = await handler({
      params: {},
      query: {},
      body: { body: "Content without title" },
      headers: {},
    });
    expect(result.statusCode).toBe(400);
    const body = result.body as Record<string, unknown>;
    expect(body.error).toBe("Validation failed");
    expect(body.details).toBeDefined();
  });

  it("updateHandler updates a record", async () => {
    const adapter = createMockAdapter();
    const handler = createUpdateHandler(collection, adapter);
    const result = await handler({
      params: { id: "1" },
      query: {},
      body: { title: "Updated" },
      headers: {},
    });
    expect(result.statusCode).toBe(200);
    const body = result.body as Record<string, unknown>;
    expect(body.title).toBe("Updated");
  });

  it("updateHandler returns 404 for missing record", async () => {
    const adapter = createMockAdapter();
    const handler = createUpdateHandler(collection, adapter);
    const result = await handler({
      params: { id: "999" },
      query: {},
      body: { title: "Nope" },
      headers: {},
    });
    expect(result.statusCode).toBe(404);
  });

  it("deleteHandler deletes a record", async () => {
    const adapter = createMockAdapter();
    const handler = createDeleteHandler(collection, adapter);
    const result = await handler({
      params: { id: "1" },
      query: {},
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(200);
    const body = result.body as Record<string, unknown>;
    expect(body.deleted).toBe(true);
  });

  it("deleteHandler returns 404 for missing record", async () => {
    const adapter = createMockAdapter();
    const handler = createDeleteHandler(collection, adapter);
    const result = await handler({
      params: { id: "999" },
      query: {},
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(404);
  });

  it("bulkDeleteHandler deletes multiple records", async () => {
    const adapter = createMockAdapter();
    const handler = createBulkDeleteHandler(collection, adapter);
    const result = await handler({
      params: {},
      query: {},
      body: { ids: ["1", "2"] },
      headers: {},
    });
    expect(result.statusCode).toBe(200);
    const body = result.body as { deleted: number };
    expect(body.deleted).toBe(2);
  });

  it("bulkDeleteHandler returns 400 for missing ids", async () => {
    const adapter = createMockAdapter();
    const handler = createBulkDeleteHandler(collection, adapter);
    const result = await handler({
      params: {},
      query: {},
      body: {},
      headers: {},
    });
    expect(result.statusCode).toBe(400);
  });

  it("bulkDeleteHandler returns 400 for empty ids array", async () => {
    const adapter = createMockAdapter();
    const handler = createBulkDeleteHandler(collection, adapter);
    const result = await handler({
      params: {},
      query: {},
      body: { ids: [] },
      headers: {},
    });
    expect(result.statusCode).toBe(400);
  });
});
