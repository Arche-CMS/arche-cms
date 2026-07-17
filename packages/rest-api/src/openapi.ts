import type { CollectionDefinition, FieldDefinition } from "@arche-cms/types";
import type { RouteDefinition } from "./types.js";
import { pascalCase } from "./route-generator.js";

const SIMPLE_OPENAPI_TYPES: Record<string, Record<string, unknown> | undefined> = {
  number: { type: "number" },
  boolean: { type: "boolean" },
  checkbox: { type: "boolean" },
  json: { type: "object" },
  multiSelect: { type: "array", items: { type: "string" } },
  relation: { type: "string" },
  date: { type: "string", format: "date-time" },
  datetime: { type: "string", format: "date-time" },
  color: { type: "string", format: "color" },
  url: { type: "string", format: "uri" },
  media: { type: "string", description: "Media file ID reference" },
  upload: { type: "string", description: "Media file ID reference" },
  component: { type: "object", properties: {} },
  dynamicZone: { type: "array", items: { type: "object" } },
  array: { type: "array", items: { type: "object", properties: {} } },
  repeater: { type: "array", items: { type: "object", properties: {} } },
  object: { type: "object", properties: {} },
  group: { type: "object", properties: {} },
};

function fieldToOpenApiType(field: FieldDefinition): Record<string, unknown> {
  const nullable = !field.validation?.required;

  if (field.type === "tabs") {
    const tabFields: FieldDefinition[] = (
      (field as { tabs?: Array<{ fields: FieldDefinition[] }> }).tabs ?? []
    ).flatMap((t) => t.fields);
    return { type: "object", properties: generateFlatProperties(tabFields), nullable };
  }

  if (field.type === "select" || field.type === "radio") {
    const base: Record<string, unknown> = { type: "string" };
    if ("options" in field) {
      base.enum = (field.options as Array<{ value: string }>).map((o) =>
        typeof o === "string" ? o : o.value,
      );
    }
    return addNullable(base, nullable);
  }

  const schema = SIMPLE_OPENAPI_TYPES[field.type] ?? { type: "string" };
  return addNullable({ ...schema }, nullable);
}

function addNullable(schema: Record<string, unknown>, nullable: boolean): Record<string, unknown> {
  if (nullable) {
    schema.nullable = true;
  }
  return schema;
}

function generateFlatProperties(fields: FieldDefinition[]): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const f of fields) {
    props[f.name] = { ...fieldToOpenApiType(f), description: f.label ?? f.name };
  }
  return props;
}

function generateCollectionSchema(collection: CollectionDefinition): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    id: { type: "integer", description: "Primary key" },
  };

  for (const field of collection.fields) {
    properties[field.name] = {
      ...fieldToOpenApiType(field),
      description: field.label ?? field.name,
    };
  }

  if (collection.timestamps?.createdAt !== false) {
    properties.createdAt = { type: "string", format: "date-time" };
  }
  if (collection.timestamps?.updatedAt !== false) {
    properties.updatedAt = { type: "string", format: "date-time" };
  }

  return {
    type: "object",
    properties,
    required: collection.fields.filter((f) => f.validation?.required).map((f) => f.name),
  };
}

export interface OpenApiOptions {
  title?: string;
  version?: string;
  description?: string;
}

export function generateOpenApiSpec(
  collections: CollectionDefinition[],
  routes: RouteDefinition[],
  options?: OpenApiOptions,
): Record<string, unknown> {
  const schemas: Record<string, unknown> = {};

  for (const collection of collections) {
    const name = pascalCase(collection.slug);
    schemas[`${name}Response`] = generateCollectionSchema(collection);

    const createProps: Record<string, unknown> = {};
    const updateProps: Record<string, unknown> = {};
    for (const field of collection.fields) {
      createProps[field.name] = fieldToOpenApiType(field);
      updateProps[field.name] = { ...fieldToOpenApiType(field), nullable: true };
    }
    schemas[`${name}Create`] = { type: "object", properties: createProps };
    schemas[`${name}Update`] = { type: "object", properties: updateProps };
  }

  const paths: Record<string, unknown> = {};

  for (const route of routes) {
    const operation: Record<string, unknown> = {
      operationId: route.operationId,
      summary: route.summary,
      tags: route.tags,
      responses: {
        "200": { description: "OK" },
        "400": { description: "Bad request" },
        "404": { description: "Not found" },
        "500": { description: "Internal server error" },
      },
    };

    if (route.method === "POST") {
      operation.responses = {
        "201": { description: "Created" },
        "400": { description: "Bad request" },
        "500": { description: "Internal server error" },
      };
    }

    if (route.method === "GET" && route.path.endsWith("/:id")) {
      operation.parameters = [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ];
    }

    if (route.method === "GET" && !route.path.endsWith("/:id")) {
      operation.parameters = [
        { name: "limit", in: "query", schema: { type: "integer" } },
        { name: "offset", in: "query", schema: { type: "integer" } },
        { name: "sort", in: "query", schema: { type: "string" } },
        { name: "select", in: "query", schema: { type: "string" } },
        { name: "populate", in: "query", schema: { type: "string" } },
      ];
    }

    paths[route.path] = {
      [route.method.toLowerCase()]: operation,
    };
  }

  return {
    openapi: "3.1.0",
    info: {
      title: options?.title ?? "Arche CMS API",
      version: options?.version ?? "0.1.0",
      description: options?.description ?? "Auto-generated REST API for CMS collections",
    },
    paths,
    components: {
      schemas,
    },
  };
}
