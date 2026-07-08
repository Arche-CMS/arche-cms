import { describe, it, expect } from "vitest";
import type { CollectionDefinition, DatabaseAdapter } from "@altrugenix/database";
import { createCollectionRouter, createCollectionRouters } from "../src/route-generator.js";

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

const postCollection: CollectionDefinition = {
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  fields: [
    { name: "title", type: "text", validation: { required: true } },
    { name: "body", type: "richText" },
    { name: "author", type: "relation", to: "users" },
  ],
};

describe("createCollectionRouter", () => {
  it("generates 5 CRUD routes for a collection", () => {
    const router = createCollectionRouter(postCollection, mockAdapter);
    expect(router.routes).toHaveLength(5);
  });

  it("generates list route", () => {
    const { routes } = createCollectionRouter(postCollection, mockAdapter);
    const list = routes.find((r) => r.operationId === "listPosts") as {
      method: string;
      path: string;
      tags: string[];
    };
    expect(list.method).toBe("GET");
    expect(list.path).toBe("/api/posts");
    expect(list.tags).toEqual(["Post"]);
  });

  it("generates get route", () => {
    const { routes } = createCollectionRouter(postCollection, mockAdapter);
    const get = routes.find((r) => r.operationId === "getPosts") as {
      method: string;
      path: string;
    };
    expect(get.method).toBe("GET");
    expect(get.path).toBe("/api/posts/:id");
  });

  it("generates create route", () => {
    const { routes } = createCollectionRouter(postCollection, mockAdapter);
    const create = routes.find((r) => r.operationId === "createPosts") as {
      method: string;
      path: string;
    };
    expect(create.method).toBe("POST");
    expect(create.path).toBe("/api/posts");
  });

  it("generates update route", () => {
    const { routes } = createCollectionRouter(postCollection, mockAdapter);
    const update = routes.find((r) => r.operationId === "updatePosts") as {
      method: string;
      path: string;
    };
    expect(update.method).toBe("PATCH");
    expect(update.path).toBe("/api/posts/:id");
  });

  it("generates delete route", () => {
    const { routes } = createCollectionRouter(postCollection, mockAdapter);
    const del = routes.find((r) => r.operationId === "deletePosts") as {
      method: string;
      path: string;
    };
    expect(del.method).toBe("DELETE");
    expect(del.path).toBe("/api/posts/:id");
  });

  it("uses custom basePath", () => {
    const { routes } = createCollectionRouter(postCollection, mockAdapter, {
      basePath: "/cms/api",
    });
    for (const route of routes) {
      expect(route.path).toMatch(/^\/cms\/api\/posts/);
    }
  });

  it("handles slug with hyphens", () => {
    const collection: CollectionDefinition = {
      slug: "blog-posts",
      labels: { singular: "Blog Post", plural: "Blog Posts" },
      fields: [{ name: "title", type: "text" }],
    };
    const { routes } = createCollectionRouter(collection, mockAdapter);
    expect(routes[0]).toHaveProperty("operationId", "listBlogPosts");
    expect(routes[0]).toHaveProperty("path", "/api/blog-posts");
  });
});

describe("createCollectionRouters", () => {
  it("generates routers for multiple collections", () => {
    const userCollection: CollectionDefinition = {
      slug: "users",
      labels: { singular: "User", plural: "Users" },
      fields: [{ name: "email", type: "email" }],
    };
    const routers = createCollectionRouters([postCollection, userCollection], mockAdapter);
    expect(routers).toHaveLength(2);
    const r0 = routers[0] as { routes: { operationId: string }[] };
    const r1 = routers[1] as { routes: { operationId: string }[] };
    expect(r0.routes).toHaveLength(5);
    expect(r1.routes).toHaveLength(5);
    expect(r0.routes[0].operationId).toBe("listPosts");
    expect(r1.routes[0].operationId).toBe("listUsers");
  });
});
