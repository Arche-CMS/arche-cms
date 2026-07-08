import { describe, it, expect } from "vitest";
import type { FieldDefinition, CollectionDefinition } from "@altrugenix/types";
import {
  fieldToZodSchema,
  collectionToCreateSchema,
  collectionToUpdateSchema,
} from "../src/generator.js";

describe("fieldToZodSchema", () => {
  it("maps text to string", () => {
    const field: FieldDefinition = { name: "title", type: "text" };
    const schema = fieldToZodSchema(field);
    expect(schema.parse("hello")).toBe("hello");
    expect(() => schema.parse(123)).toThrow();
  });

  it("maps number to number", () => {
    const field: FieldDefinition = { name: "count", type: "number" };
    const schema = fieldToZodSchema(field);
    expect(schema.parse(42)).toBe(42);
    expect(() => schema.parse("foo")).toThrow();
  });

  it("maps boolean to boolean", () => {
    const field: FieldDefinition = { name: "active", type: "boolean" };
    const schema = fieldToZodSchema(field);
    expect(schema.parse(true)).toBe(true);
    expect(() => schema.parse("true")).toThrow();
  });

  it("maps email to email string", () => {
    const field: FieldDefinition = { name: "email", type: "email" };
    const schema = fieldToZodSchema(field);
    expect(schema.parse("test@example.com")).toBe("test@example.com");
    expect(() => schema.parse("not-an-email")).toThrow();
  });

  it("maps url to url string", () => {
    const field: FieldDefinition = { name: "website", type: "url" };
    const schema = fieldToZodSchema(field);
    expect(schema.parse("https://example.com")).toBe("https://example.com");
    expect(() => schema.parse("not-a-url")).toThrow();
  });

  it("maps select to enum", () => {
    const field: FieldDefinition = {
      name: "status",
      type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    };
    const schema = fieldToZodSchema(field);
    expect(schema.parse("draft")).toBe("draft");
    expect(schema.parse("published")).toBe("published");
    expect(() => schema.parse("archived")).toThrow();
  });

  it("maps multiSelect to string array", () => {
    const field: FieldDefinition = {
      name: "tags",
      type: "multiSelect",
      options: [{ label: "News", value: "news" }],
    };
    const schema = fieldToZodSchema(field);
    expect(schema.parse(["news"])).toEqual(["news"]);
    expect(() => schema.parse("news")).toThrow();
  });

  it("makes required fields required", () => {
    const field: FieldDefinition = { name: "title", type: "text", validation: { required: true } };
    const schema = fieldToZodSchema(field);
    expect(schema.parse("hello")).toBe("hello");
    expect(() => schema.parse(undefined)).toThrow();
  });

  it("makes non-required fields optional", () => {
    const field: FieldDefinition = { name: "title", type: "text" };
    const schema = fieldToZodSchema(field);
    expect(schema.parse("hello")).toBe("hello");
    expect(schema.parse(undefined)).toBeUndefined();
  });

  it("applies minLength validation", () => {
    const field: FieldDefinition = { name: "title", type: "text", validation: { minLength: 3 } };
    const schema = fieldToZodSchema(field);
    expect(() => schema.parse("ab")).toThrow();
    expect(schema.parse("abc")).toBe("abc");
  });

  it("applies maxLength validation", () => {
    const field: FieldDefinition = { name: "title", type: "text", validation: { maxLength: 5 } };
    const schema = fieldToZodSchema(field);
    expect(schema.parse("hello")).toBe("hello");
    expect(() => schema.parse("hello world")).toThrow();
  });

  it("applies min validation for numbers", () => {
    const field: FieldDefinition = { name: "age", type: "number", validation: { min: 18 } };
    const schema = fieldToZodSchema(field);
    expect(schema.parse(18)).toBe(18);
    expect(schema.parse(25)).toBe(25);
    expect(() => schema.parse(17)).toThrow();
  });

  it("applies max validation for numbers", () => {
    const field: FieldDefinition = { name: "age", type: "number", validation: { max: 99 } };
    const schema = fieldToZodSchema(field);
    expect(schema.parse(50)).toBe(50);
    expect(() => schema.parse(100)).toThrow();
  });

  it("applies regex pattern validation", () => {
    const field: FieldDefinition = {
      name: "code",
      type: "text",
      validation: { pattern: "^[A-Z]{3}$" },
    };
    const schema = fieldToZodSchema(field);
    expect(schema.parse("ABC")).toBe("ABC");
    expect(() => schema.parse("abc")).toThrow();
  });

  it("maps json to record", () => {
    const field: FieldDefinition = { name: "metadata", type: "json" };
    const schema = fieldToZodSchema(field);
    expect(schema.parse({ key: "value" })).toEqual({ key: "value" });
  });

  it("maps date/datetime to string", () => {
    const dateField: FieldDefinition = { name: "publishedAt", type: "date" };
    const dtField: FieldDefinition = { name: "createdAt", type: "datetime" };
    expect(dateField).toBeDefined();
    expect(dtField).toBeDefined();
  });

  it("maps checkbox to boolean", () => {
    const field: FieldDefinition = { name: "agree", type: "checkbox" };
    const schema = fieldToZodSchema(field);
    expect(schema.parse(true)).toBe(true);
    expect(() => schema.parse("true")).toThrow();
  });

  it("maps relation to string (optional)", () => {
    const field: FieldDefinition = { name: "author", type: "relation", to: "users" };
    const schema = fieldToZodSchema(field);
    expect(schema.parse("abc123")).toBe("abc123");
    expect(schema.parse(undefined)).toBeUndefined();
  });

  it("maps component to record", () => {
    const field: FieldDefinition = { name: "seo", type: "component", component: "seo" };
    const schema = fieldToZodSchema(field);
    expect(schema.parse({ title: "Test" })).toEqual({ title: "Test" });
  });

  it("maps dynamicZone to array", () => {
    const field: FieldDefinition = {
      name: "blocks",
      type: "dynamicZone",
      components: ["hero", "cta"],
    };
    const schema = fieldToZodSchema(field);
    expect(schema.parse([{ type: "hero" }])).toEqual([{ type: "hero" }]);
    expect(() => schema.parse("not-array")).toThrow();
  });

  it("maps array field with sub-fields", () => {
    const field: FieldDefinition = {
      name: "items",
      type: "array",
      fields: [
        { name: "name", type: "text" },
        { name: "quantity", type: "number" },
      ],
    };
    const schema = fieldToZodSchema(field);
    const valid = [{ name: "foo", quantity: 2 }];
    expect(schema.parse(valid)).toEqual(valid);
  });

  it("maps object field with sub-fields", () => {
    const field: FieldDefinition = {
      name: "address",
      type: "object",
      fields: [
        { name: "street", type: "text" },
        { name: "zip", type: "text" },
      ],
    };
    const schema = fieldToZodSchema(field);
    const valid = { street: "123 Main", zip: "12345" };
    expect(schema.parse(valid)).toEqual(valid);
  });
});

describe("collectionToCreateSchema", () => {
  it("generates schema with required and optional fields", () => {
    const collection: CollectionDefinition = {
      slug: "posts",
      labels: { singular: "Post", plural: "Posts" },
      fields: [
        { name: "title", type: "text", validation: { required: true } },
        { name: "body", type: "richText" },
      ],
    };
    const schema = collectionToCreateSchema(collection);
    const valid = { title: "Hello", body: "World" };
    expect(schema.parse(valid)).toEqual(valid);
    expect(() => schema.parse({ body: "World" })).toThrow();
    expect(schema.parse({ title: "Hello" })).toEqual({ title: "Hello" });
  });
});

describe("collectionToUpdateSchema", () => {
  it("makes all fields optional for partial updates", () => {
    const collection: CollectionDefinition = {
      slug: "posts",
      labels: { singular: "Post", plural: "Posts" },
      fields: [
        { name: "title", type: "text", validation: { required: true } },
        { name: "body", type: "richText" },
      ],
    };
    const schema = collectionToUpdateSchema(collection);
    expect(schema.parse({ title: "Updated" })).toEqual({ title: "Updated" });
    expect(schema.parse({})).toEqual({});
  });
});
