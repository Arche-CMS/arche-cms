import { describe, it, expect } from "vitest";
import type { CollectionDefinition, GlobalDefinition, DatabaseAdapter } from "@altrugenix/database";
import {
  createGlobalGetHandler,
  createGlobalUpsertHandler,
  createCreateHandler,
  createUpdateHandler,
  createListHandler,
  createGetHandler,
} from "../src/handlers.js";

function createGlobalAdapter(): DatabaseAdapter {
  let globalStore: Record<string, unknown> | null = null;
  return {
    findOne: async (_collection, id) => (id === "1" ? globalStore : null),
    findMany: async () => ({ data: [], total: 0 }),
    create: async (_collection, data) => {
      globalStore = { ...data };
      return globalStore;
    },
    update: async (_collection, id, data) => {
      if (id !== "1") return null;
      globalStore = { ...globalStore, ...data };
      return globalStore;
    },
    delete: async () => false,
    deleteMany: async () => 0,
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

const globalDef: GlobalDefinition = {
  slug: "site-settings",
  label: "Site Settings",
  fields: [
    { name: "title", type: "text", validation: { required: true } },
    { name: "description", type: "textarea" },
  ],
};

const collection: CollectionDefinition = {
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  fields: [
    { name: "title", type: "text", validation: { required: true } },
    { name: "slug", type: "slug", validation: { required: true } },
  ],
};

describe("global handlers", () => {
  describe("createGlobalGetHandler", () => {
    it("returns empty object when no record exists", async () => {
      const adapter = createGlobalAdapter();
      const handler = createGlobalGetHandler(globalDef, adapter);
      const result = await handler({ params: {}, query: {}, body: null, headers: {} });
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    it("returns existing record", async () => {
      const adapter = createGlobalAdapter();
      await adapter.create("__cms_site_settings", { title: "My Site" });
      const handler = createGlobalGetHandler(globalDef, adapter);
      const result = await handler({ params: {}, query: {}, body: null, headers: {} });
      expect(result.statusCode).toBe(200);
      const body = result.body as Record<string, unknown>;
      expect(body.title).toBe("My Site");
    });
  });

  describe("createGlobalUpsertHandler", () => {
    it("creates record when none exists", async () => {
      const adapter = createGlobalAdapter();
      const handler = createGlobalUpsertHandler(globalDef, adapter);
      const result = await handler({
        params: {},
        query: {},
        body: { title: "New Settings" },
        headers: {},
      });
      expect(result.statusCode).toBe(200);
      const body = result.body as Record<string, unknown>;
      expect(body.title).toBe("New Settings");
    });

    it("updates record when one exists", async () => {
      const adapter = createGlobalAdapter();
      await adapter.create("__cms_site_settings", { title: "Old" });
      const handler = createGlobalUpsertHandler(globalDef, adapter);
      const result = await handler({
        params: {},
        query: {},
        body: { title: "Updated" },
        headers: {},
      });
      expect(result.statusCode).toBe(200);
      const body = result.body as Record<string, unknown>;
      expect(body.title).toBe("Updated");
    });

    it("returns 400 for missing body", async () => {
      const adapter = createGlobalAdapter();
      const handler = createGlobalUpsertHandler(globalDef, adapter);
      const result = await handler({ params: {}, query: {}, body: null, headers: {} });
      expect(result.statusCode).toBe(400);
    });
  });
});

describe("unique constraint error handling", () => {
  function createAdapterWithUniqueError(): DatabaseAdapter {
    return {
      findOne: async () => null,
      findMany: async () => ({ data: [], total: 0 }),
      create: async () => {
        throw new Error("UNIQUE constraint failed: posts.slug");
      },
      update: async () => {
        throw new Error("UNIQUE constraint failed: posts.slug");
      },
      delete: async () => false,
      deleteMany: async () => 0,
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

  it("createHandler returns 409 on unique constraint violation", async () => {
    const adapter = createAdapterWithUniqueError();
    const handler = createCreateHandler(collection, adapter);
    const result = await handler({
      params: {},
      query: {},
      body: { title: "Test", slug: "test" },
      headers: {},
    });
    expect(result.statusCode).toBe(409);
    expect(result.body).toHaveProperty("code", "CONFLICT");
  });

  it("updateHandler returns 409 on unique constraint violation", async () => {
    const adapter = createAdapterWithUniqueError();
    const handler = createUpdateHandler(collection, adapter);
    const result = await handler({
      params: { id: "1" },
      query: {},
      body: { slug: "taken" },
      headers: {},
    });
    expect(result.statusCode).toBe(409);
    expect(result.body).toHaveProperty("code", "CONFLICT");
  });
});

describe("adapter error handling", () => {
  function createFailingAdapter(): DatabaseAdapter {
    return {
      findOne: async () => {
        throw new Error("DB connection failed");
      },
      findMany: async () => {
        throw new Error("DB connection failed");
      },
      create: async () => {
        throw new Error("DB connection failed");
      },
      update: async () => {
        throw new Error("DB connection failed");
      },
      delete: async () => {
        throw new Error("DB connection failed");
      },
      deleteMany: async () => {
        throw new Error("DB connection failed");
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

  it("listHandler returns 500 on adapter error", async () => {
    const adapter = createFailingAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({ params: {}, query: {}, body: null, headers: {} });
    expect(result.statusCode).toBe(500);
    expect(result.body).toHaveProperty("error", "DB connection failed");
  });

  it("getHandler returns 500 on adapter error", async () => {
    const adapter = createFailingAdapter();
    const handler = createGetHandler(collection, adapter);
    const result = await handler({ params: { id: "1" }, query: {}, body: null, headers: {} });
    expect(result.statusCode).toBe(500);
    expect(result.body).toHaveProperty("error", "DB connection failed");
  });

  it("createHandler returns 500 on adapter error", async () => {
    const adapter = createFailingAdapter();
    const handler = createCreateHandler(collection, adapter);
    const result = await handler({
      params: {},
      query: {},
      body: { title: "Test", slug: "test" },
      headers: {},
    });
    expect(result.statusCode).toBe(500);
  });

  it("updateHandler returns 500 on adapter error", async () => {
    const adapter = createFailingAdapter();
    const handler = createUpdateHandler(collection, adapter);
    const result = await handler({
      params: { id: "1" },
      query: {},
      body: { title: "Test" },
      headers: {},
    });
    expect(result.statusCode).toBe(500);
  });

  it("globalGetHandler returns 500 on adapter error", async () => {
    const adapter = createFailingAdapter();
    const handler = createGlobalGetHandler(
      { slug: "settings", label: "Settings", fields: [] },
      adapter,
    );
    const result = await handler({ params: {}, query: {}, body: null, headers: {} });
    expect(result.statusCode).toBe(500);
  });

  it("globalUpsertHandler returns 500 on adapter error", async () => {
    const adapter = createFailingAdapter();
    const handler = createGlobalUpsertHandler(
      { slug: "settings", label: "Settings", fields: [] },
      adapter,
    );
    const result = await handler({ params: {}, query: {}, body: { title: "Test" }, headers: {} });
    expect(result.statusCode).toBe(500);
  });
});

describe("query validation edge cases", () => {
  it("listHandler rejects invalid limit", async () => {
    const adapter = createGlobalAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({
      params: {},
      query: { limit: "invalid" },
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(400);
    expect(result.body).toHaveProperty("error");
  });

  it("listHandler rejects negative limit", async () => {
    const adapter = createGlobalAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({
      params: {},
      query: { limit: "-5" },
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(400);
  });

  it("listHandler rejects non-integer offset", async () => {
    const adapter = createGlobalAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({
      params: {},
      query: { offset: "abc" },
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(400);
  });

  it("listHandler rejects empty sort string", async () => {
    const adapter = createGlobalAdapter();
    const handler = createListHandler(collection, adapter, 100, 10);
    const result = await handler({
      params: {},
      query: { sort: "" },
      body: null,
      headers: {},
    });
    expect(result.statusCode).toBe(400);
  });
});
