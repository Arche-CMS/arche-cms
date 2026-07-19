import type { ServerConfig } from "@arche-cms/cms/src/server/config.js";
import type { DatabaseAdapter } from "@arche-cms/database";
import type { CollectionDefinition, GlobalDefinition, ComponentDefinition } from "@arche-cms/types";
import type { FastifyInstance } from "fastify";

import { createApp } from "@arche-cms/cms/src/server/app.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

function createMockAdapter(): DatabaseAdapter {
  const collections = new Map<string, Map<string, Record<string, unknown>>>();
  const users = new Map<string, Record<string, unknown>>();
  const roles = new Map<string, Record<string, unknown>>();
  let nextUserId = 1;
  let nextRoleId = 1;

  function getTable(table: string): Map<string, Record<string, unknown>> {
    if (!collections.has(table)) {
      collections.set(table, new Map());
    }
    return collections.get(table) ?? new Map();
  }

  return {
    connect: async () => {},
    create: async (_table: string, data: Record<string, unknown>) => {
      if (_table === "__cms_users") {
        const id = String(nextUserId++);
        const record = { id, ...data };
        users.set(id, record);
        return record;
      }
      if (_table === "__cms_roles") {
        const id = String(nextRoleId++);
        const record = { id, ...data };
        roles.set(id, record);
        return record;
      }
      const table = getTable(_table);
      const nextId = String(table.size + 1);
      const record = { id: nextId, ...data };
      table.set(nextId, record);
      return record;
    },
    createTable: async () => {},
    delete: async (_table: string, id: string) => {
      const table = getTable(_table);
      return table.delete(id);
    },
    deleteMany: async (_table: string, ids: string[]) => {
      const table = getTable(_table);
      let count = 0;
      for (const id of ids) {
        if (table.delete(id)) count++;
      }
      return count;
    },
    disconnect: async () => {},
    dropTable: async () => {},
    findMany: async (_table: string, options?) => {
      if (_table === "__cms_users") {
        let all = [...users.values()];
        if (options?.where?.email) {
          all = all.filter((r) => r.email === options.where.email);
        }
        return { data: all.slice(0, options?.limit ?? 100), total: all.length };
      }
      if (_table === "__cms_roles") {
        let all = [...roles.values()];
        if (options?.where?.name) {
          all = all.filter((r) => r.name === options.where.name);
        }
        return { data: all.slice(0, options?.limit ?? 100), total: all.length };
      }
      const table = getTable(_table);
      let all = [...table.values()];
      if (options?.where) {
        for (const [key, value] of Object.entries(options.where)) {
          all = all.filter((r) => r[key] === value);
        }
      }
      if (options?.sort) {
        const sortKey = Object.keys(options.sort)[0];
        if (sortKey) {
          const dir = options.sort[sortKey];
          all.sort((a, b) => {
            const av = a[sortKey] ?? "";
            const bv = b[sortKey] ?? "";
            if (dir === "desc") return String(bv).localeCompare(String(av));
            return String(av).localeCompare(String(bv));
          });
        }
      }
      const offset = options?.offset ?? 0;
      const limit = options?.limit ?? 100;
      return { data: all.slice(offset, offset + limit), total: all.length };
    },
    findOne: async (_table: string, id: string) => {
      if (_table === "__cms_users") return users.get(id) ?? null;
      if (_table === "__cms_roles") return roles.get(id) ?? null;
      const table = getTable(_table);
      return table.get(id) ?? null;
    },
    getExecutedMigrations: async () => [],
    getExistingSchema: async () => ({ tables: new Map() }),
    raw: async () => [],
    runMigration: async () => {},
    transaction: async <T>(fn: () => Promise<T>) => fn(),
    update: async (_table: string, id: string, data: Record<string, unknown>) => {
      if (_table === "__cms_users") {
        const existing = users.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...data };
        users.set(id, updated);
        return updated;
      }
      if (_table === "__cms_roles") {
        const existing = roles.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...data };
        roles.set(id, updated);
        return updated;
      }
      const table = getTable(_table);
      const existing = table.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data };
      table.set(id, updated);
      return updated;
    },
  };
}

const postsCollection: CollectionDefinition = {
  fields: [
    { name: "title", type: "text", validation: { required: true } },
    { name: "slug", source: "title", type: "slug", validation: { required: true } },
    { name: "content", type: "richText" },
    {
      name: "status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      type: "select",
    },
  ],
  labels: { plural: "Posts", singular: "Post" },
  slug: "posts",
};

const allFieldsCollection: CollectionDefinition = {
  fields: [
    { name: "title", type: "text", validation: { required: true } },
    { name: "excerpt", type: "textarea" },
    { name: "order", type: "number" },
    { name: "featured", type: "boolean" },
    { name: "publishDate", type: "date" },
    { name: "scheduledAt", type: "datetime" },
    { name: "contactEmail", type: "email" },
    { name: "secretKey", type: "password" },
    { name: "website", type: "url" },
    { name: "metadata", type: "json" },
    { name: "content", type: "richText" },
    { name: "notes", type: "markdown" },
    { name: "snippet", type: "code" },
    { name: "brandColor", type: "color" },
    { name: "featuredImage", type: "media" },
    { name: "attachment", type: "upload" },
    {
      name: "status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
      type: "select",
    },
    {
      name: "tags",
      options: [
        { label: "Technology", value: "technology" },
        { label: "Design", value: "design" },
        { label: "Business", value: "business" },
      ],
      type: "multiSelect",
    },
    {
      name: "priority",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
      type: "radio",
    },
    { name: "published", type: "checkbox" },
    { name: "slug", source: "title", type: "slug", validation: { required: true } },
  ],
  labels: { plural: "All Fields", singular: "All Field" },
  slug: "all-fields",
};

const seoComponent: ComponentDefinition = {
  fields: [
    { name: "title", type: "text", validation: { required: true } },
    { name: "description", type: "textarea" },
    { name: "ogImage", type: "text" },
  ],
  label: "SEO",
  slug: "seo",
};

const mediaCardComponent: ComponentDefinition = {
  fields: [
    { name: "image", type: "media", validation: { required: true } },
    { name: "title", type: "text", validation: { required: true } },
    { name: "description", type: "textarea" },
  ],
  label: "Media Card",
  slug: "media-card",
};

const siteSettingsGlobal: GlobalDefinition = {
  fields: [
    { name: "siteName", type: "text", validation: { required: true } },
    { name: "siteDescription", type: "textarea" },
    { name: "adminEmail", type: "email" },
    {
      name: "defaultLocale",
      options: [
        { label: "English", value: "en" },
        { label: "French", value: "fr" },
        { label: "Spanish", value: "es" },
      ],
      type: "select",
    },
  ],
  label: "Site Settings",
  slug: "site-settings",
};

const homepageGlobal: GlobalDefinition = {
  fields: [
    { name: "title", type: "text", validation: { required: true } },
    { name: "slug", type: "slug", validation: { required: true } },
    { name: "content", type: "richText", validation: { required: true } },
  ],
  label: "Homepage",
  slug: "homepage",
};

const choiceFieldsGlobal: GlobalDefinition = {
  fields: [
    {
      name: "defaultStatus",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      type: "select",
    },
    {
      name: "enabledFeatures",
      options: [
        { label: "Comments", value: "comments" },
        { label: "Search", value: "search" },
        { label: "Analytics", value: "analytics" },
      ],
      type: "multiSelect",
    },
    {
      name: "maintenanceMode",
      options: [
        { label: "Off", value: "off" },
        { label: "On", value: "on" },
      ],
      type: "radio",
    },
    { name: "enableRegistration", type: "checkbox" },
  ],
  label: "Choice Fields",
  slug: "choice-fields",
};

const advancedFieldsGlobal: GlobalDefinition = {
  fields: [
    { name: "customSettings", type: "json" },
    { name: "customScript", type: "code" },
    { name: "primaryColor", type: "color" },
    { name: "tagline", type: "text" },
    { name: "welcomeMessage", type: "richText" },
  ],
  label: "Advanced Fields",
  slug: "advanced-fields",
};

const testConfig: ServerConfig = {
  auth: {
    accessTokenExpiresIn: "15m",
    adminPassword: "admin123",
    refreshTokenExpiresIn: "7d",
    secret: "test-secret-at-least-32-chars-long-for-security!!",
  },
  cors: { origin: "*" },
  database: { adapter: "sqlite", url: ":memory:" },
  host: "localhost",
  logger: { level: "silent" },
  port: 0,
  rateLimit: { max: 1000, timeWindow: "1 minute" },
  schema: { baseDir: "./cms" },
  storage: { baseDir: "./uploads" },
  swagger: { description: "Playground", title: "Playground API", version: "1.0.0" },
};

describe("Playground E2E — Collections", () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    const adapter = createMockAdapter();
    app = await createApp({
      adapter,
      collections: [postsCollection, allFieldsCollection],
      components: [seoComponent, mediaCardComponent],
      config: testConfig,
      globals: [siteSettingsGlobal, homepageGlobal, choiceFieldsGlobal, advancedFieldsGlobal],
    });
    const loginRes = await app.inject({
      body: { email: "admin@arche-cms.com", password: "admin123" },
      method: "POST",
      url: "/api/auth/login",
    });
    authToken = JSON.parse(loginRes.body).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  const auth = () => ({ authorization: `Bearer ${authToken}` });

  describe("Posts CRUD", () => {
    let postId: string;

    it("POST /api/posts creates a post", async () => {
      const res = await app.inject({
        body: { slug: "hello-world", status: "draft", title: "Hello World" },
        headers: auth(),
        method: "POST",
        url: "/api/posts",
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.title).toBe("Hello World");
      expect(body.slug).toBe("hello-world");
      expect(body.status).toBe("draft");
      expect(body.id).toBeDefined();
      postId = body.id;
    });

    it("GET /api/posts lists posts", async () => {
      const res = await app.inject({ headers: auth(), method: "GET", url: "/api/posts" });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data).toBeDefined();
      expect(body.total).toBeGreaterThanOrEqual(1);
    });

    it("GET /api/posts/:id returns a post", async () => {
      const res = await app.inject({
        headers: auth(),
        method: "GET",
        url: `/api/posts/${postId}`,
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.title).toBe("Hello World");
    });

    it("PATCH /api/posts/:id updates a post", async () => {
      const res = await app.inject({
        body: { title: "Updated Title" },
        headers: auth(),
        method: "PATCH",
        url: `/api/posts/${postId}`,
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.title).toBe("Updated Title");
    });

    it("DELETE /api/posts/:id deletes a post", async () => {
      const res = await app.inject({
        headers: auth(),
        method: "DELETE",
        url: `/api/posts/${postId}`,
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("All Fields Collection CRUD", () => {
    let entryId: string;

    it("POST /api/all-fields creates an entry with basic fields", async () => {
      const res = await app.inject({
        body: {
          contactEmail: "test@example.com",
          featured: true,
          order: 42,
          published: true,
          slug: "all-fields-entry",
          status: "published",
          title: "All Fields Entry",
        },
        headers: auth(),
        method: "POST",
        url: "/api/all-fields",
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.title).toBe("All Fields Entry");
      expect(body.order).toBe(42);
      expect(body.featured).toBe(true);
      expect(body.published).toBe(true);
      expect(body.contactEmail).toBe("test@example.com");
      expect(body.status).toBe("published");
      expect(body.id).toBeDefined();
      entryId = body.id;
    });

    it("GET /api/all-fields lists entries", async () => {
      const res = await app.inject({ headers: auth(), method: "GET", url: "/api/all-fields" });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.data).toBeDefined();
      expect(body.total).toBeGreaterThanOrEqual(1);
    });

    it("GET /api/all-fields/:id returns the entry", async () => {
      const res = await app.inject({
        headers: auth(),
        method: "GET",
        url: `/api/all-fields/${entryId}`,
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.title).toBe("All Fields Entry");
    });

    it("PATCH /api/all-fields/:id updates with choice fields", async () => {
      const res = await app.inject({
        body: { priority: "high", tags: ["technology", "design"] },
        headers: auth(),
        method: "PATCH",
        url: `/api/all-fields/${entryId}`,
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.priority).toBe("high");
      expect(body.tags).toEqual(["technology", "design"]);
    });

    it("DELETE /api/all-fields/:id deletes the entry", async () => {
      const res = await app.inject({
        headers: auth(),
        method: "DELETE",
        url: `/api/all-fields/${entryId}`,
      });
      expect(res.statusCode).toBe(200);
    });
  });
});

describe("Playground E2E — Globals", () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    const adapter = createMockAdapter();
    app = await createApp({
      adapter,
      collections: [],
      config: testConfig,
      globals: [siteSettingsGlobal, homepageGlobal, choiceFieldsGlobal, advancedFieldsGlobal],
    });
    const loginRes = await app.inject({
      body: { email: "admin@arche-cms.com", password: "admin123" },
      method: "POST",
      url: "/api/auth/login",
    });
    authToken = JSON.parse(loginRes.body).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  const auth = () => ({ authorization: `Bearer ${authToken}` });

  it("PUT /api/globals/site-settings upserts site settings", async () => {
    const res = await app.inject({
      body: { adminEmail: "admin@example.com", defaultLocale: "en", siteName: "My Playground" },
      headers: auth(),
      method: "PUT",
      url: "/api/globals/site-settings",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.siteName).toBe("My Playground");
    expect(body.adminEmail).toBe("admin@example.com");
  });

  it("GET /api/globals/site-settings returns saved data", async () => {
    const res = await app.inject({
      headers: auth(),
      method: "GET",
      url: "/api/globals/site-settings",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.siteName).toBe("My Playground");
  });

  it("PUT /api/globals/homepage upserts homepage", async () => {
    const res = await app.inject({
      body: { content: "Welcome!", slug: "/", title: "Home" },
      headers: auth(),
      method: "PUT",
      url: "/api/globals/homepage",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.title).toBe("Home");
    expect(body.slug).toBe("/");
  });

  it("PUT /api/globals/choice-fields upserts choice fields", async () => {
    const res = await app.inject({
      body: { defaultStatus: "draft", enableRegistration: true, maintenanceMode: "off" },
      headers: auth(),
      method: "PUT",
      url: "/api/globals/choice-fields",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.defaultStatus).toBe("draft");
    expect(body.enableRegistration).toBe(true);
    expect(body.maintenanceMode).toBe("off");
  });

  it("PUT /api/globals/advanced-fields upserts advanced fields", async () => {
    const res = await app.inject({
      body: { customScript: "console.log('hi')", primaryColor: "#ff0000", tagline: "Build fast" },
      headers: auth(),
      method: "PUT",
      url: "/api/globals/advanced-fields",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.primaryColor).toBe("#ff0000");
    expect(body.tagline).toBe("Build fast");
  });

  it("GET /api/globals/unknown-global returns 404", async () => {
    const res = await app.inject({
      headers: auth(),
      method: "GET",
      url: "/api/globals/nonexistent",
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("Playground E2E — Schemas", () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    const adapter = createMockAdapter();
    app = await createApp({
      adapter,
      collections: [postsCollection, allFieldsCollection],
      components: [seoComponent, mediaCardComponent],
      config: testConfig,
      globals: [siteSettingsGlobal, homepageGlobal, choiceFieldsGlobal, advancedFieldsGlobal],
    });
    const loginRes = await app.inject({
      body: { email: "admin@arche-cms.com", password: "admin123" },
      method: "POST",
      url: "/api/auth/login",
    });
    authToken = JSON.parse(loginRes.body).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  const auth = () => ({ authorization: `Bearer ${authToken}` });

  it("GET /api/schemas returns all schemas as flat array", async () => {
    const res = await app.inject({
      headers: auth(),
      method: "GET",
      url: "/api/schemas",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    const collectionSlugs = body.data
      .filter((s: { type: string }) => s.type === "collection")
      .map((s: { slug: string }) => s.slug);
    expect(collectionSlugs).toContain("posts");
    expect(collectionSlugs).toContain("all-fields");
  });

  it("GET /api/schemas returns globals and components", async () => {
    const res = await app.inject({
      headers: auth(),
      method: "GET",
      url: "/api/schemas",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    const types = body.data.map((s: { type: string }) => s.type);
    expect(types).toContain("collection");
    expect(types).toContain("global");
  });

  it("GET /api/schemas/collection/posts returns collection schema with fields", async () => {
    const res = await app.inject({
      headers: auth(),
      method: "GET",
      url: "/api/schemas/collection/posts",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.slug).toBe("posts");
    expect(body.type).toBe("collection");
    expect(body.fields).toBeDefined();
    expect(body.fields.length).toBe(4);
  });

  it("GET /api/schemas/collection/all-fields returns collection schema", async () => {
    const res = await app.inject({
      headers: auth(),
      method: "GET",
      url: "/api/schemas/collection/all-fields",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.slug).toBe("all-fields");
    expect(body.type).toBe("collection");
    expect(Array.isArray(body.fields)).toBe(true);
  });
});

describe("Playground E2E — Auth Flow", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const adapter = createMockAdapter();
    app = await createApp({
      adapter,
      collections: [postsCollection],
      config: testConfig,
      globals: [],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /api/auth/register creates a user", async () => {
    const res = await app.inject({
      body: { email: "user@test.com", name: "Test User", password: "password123" },
      method: "POST",
      url: "/api/auth/register",
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.user.email).toBe("user@test.com");
  });

  it("POST /api/auth/login returns tokens", async () => {
    const res = await app.inject({
      body: { email: "admin@arche-cms.com", password: "admin123" },
      method: "POST",
      url: "/api/auth/login",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });

  it("GET /api/auth/me returns current user", async () => {
    const loginRes = await app.inject({
      body: { email: "admin@arche-cms.com", password: "admin123" },
      method: "POST",
      url: "/api/auth/login",
    });
    const { accessToken } = JSON.parse(loginRes.body);
    const res = await app.inject({
      headers: { authorization: `Bearer ${accessToken}` },
      method: "GET",
      url: "/api/auth/me",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.email).toBe("admin@arche-cms.com");
  });

  it("rejects unauthenticated requests", async () => {
    const res = await app.inject({ method: "GET", url: "/api/posts" });
    expect(res.statusCode).toBe(401);
  });
});

describe("Playground E2E — Health & Docs", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const adapter = createMockAdapter();
    app = await createApp({
      adapter,
      collections: [postsCollection],
      config: testConfig,
      globals: [],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ok");
  });

  it("GET /docs returns Swagger UI", async () => {
    const res = await app.inject({ method: "GET", url: "/docs" });
    expect(res.statusCode).toBe(200);
  });

  it("GET /docs/json returns OpenAPI spec", async () => {
    const res = await app.inject({ method: "GET", url: "/docs/json" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.openapi).toBe("3.0.3");
    expect(body.info.title).toBe("Playground API");
  });
});
