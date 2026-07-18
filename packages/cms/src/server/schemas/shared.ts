import type { FastifySchema } from "fastify";

// ---------------------------------------------------------------------------
// Error response schemas
// ---------------------------------------------------------------------------

export const errorSchema = {
  properties: {
    error: { type: "string" },
  },
  required: ["error"],
  type: "object",
} as const;

export const errorWithCodeSchema = {
  properties: {
    code: { type: "string" },
    error: { type: "string" },
  },
  required: ["error"],
  type: "object",
} as const;

// ---------------------------------------------------------------------------
// Common param / query schemas
// ---------------------------------------------------------------------------

export const idParamSchema = {
  properties: {
    id: { description: "Resource ID", type: "string" },
  },
  required: ["id"],
  type: "object",
} as const;

export const slugParamSchema = {
  properties: {
    slug: { description: "Resource slug", type: "string" },
  },
  required: ["slug"],
  type: "object",
} as const;

export const typeSlugParamSchema = {
  properties: {
    slug: { description: "Schema slug", type: "string" },
    type: {
      description: "Schema type",
      enum: ["collection", "global", "component"],
      type: "string",
    },
  },
  required: ["type", "slug"],
  type: "object",
} as const;

export const typeParamSchema = {
  properties: {
    type: {
      description: "Schema type",
      enum: ["collection", "global", "component"],
      type: "string",
    },
  },
  required: ["type"],
  type: "object",
} as const;

// ---------------------------------------------------------------------------
// Paginated list response helper
// ---------------------------------------------------------------------------

export function paginatedResponseSchema(
  itemSchema: Record<string, unknown>,
): FastifySchema["response"] {
  return {
    "2xx": {
      properties: {
        data: { items: itemSchema, type: "array" },
        total: { type: "number" },
      },
      required: ["data", "total"],
      type: "object",
    },
  };
}

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const authTokensResponseSchema = {
  properties: {
    accessToken: { type: "string" },
    refreshToken: { type: "string" },
  },
  required: ["accessToken", "refreshToken"],
  type: "object",
} as const;

export const authUserResponseSchema = {
  properties: {
    user: {
      properties: {
        email: { type: "string" },
        id: { type: "string" },
        role: { type: "string" },
      },
      required: ["email", "id", "role"],
      type: "object",
    },
  },
  required: ["user"],
  type: "object",
} as const;

// ---------------------------------------------------------------------------
// User schemas
// ---------------------------------------------------------------------------

export const userObjectSchema = {
  properties: {
    createdAt: { type: "string" },
    email: { type: "string" },
    id: { type: "string" },
    role: { type: "string" },
    updatedAt: { type: "string" },
  },
  type: "object",
} as const;

export const userListResponseSchema = {
  "2xx": {
    properties: {
      data: { items: userObjectSchema, type: "array" },
      total: { type: "number" },
    },
    required: ["data", "total"],
    type: "object",
  },
} as const;

// ---------------------------------------------------------------------------
// Role schemas
// ---------------------------------------------------------------------------

export const permissionObjectSchema = {
  properties: {
    action: { type: "string" },
    resource: { type: "string" },
  },
  required: ["action", "resource"],
  type: "object",
} as const;

export const roleObjectSchema = {
  properties: {
    createdAt: { type: "string" },
    description: { type: "string" },
    id: { type: "string" },
    name: { type: "string" },
    permissions: { items: permissionObjectSchema, type: "array" },
    updatedAt: { type: "string" },
  },
  type: "object",
} as const;

export const roleListResponseSchema = {
  "2xx": {
    properties: {
      data: { items: roleObjectSchema, type: "array" },
      total: { type: "number" },
    },
    required: ["data", "total"],
    type: "object",
  },
} as const;

// ---------------------------------------------------------------------------
// API Token schemas
// ---------------------------------------------------------------------------

export const apiTokenObjectSchema = {
  properties: {
    createdAt: { type: "string" },
    createdBy: { type: "string" },
    description: { type: "string" },
    id: { type: "string" },
    lastFour: { type: "string" },
    lastUsedAt: { type: ["string", "null"] },
    name: { type: "string" },
  },
  type: "object",
} as const;

export const apiTokenListResponseSchema = {
  "2xx": {
    properties: {
      data: { items: apiTokenObjectSchema, type: "array" },
      total: { type: "number" },
    },
    required: ["data", "total"],
    type: "object",
  },
} as const;

// ---------------------------------------------------------------------------
// Webhook schemas
// ---------------------------------------------------------------------------

export const webhookObjectSchema = {
  properties: {
    collection: { type: "string" },
    createdAt: { type: "string" },
    enabled: { type: "boolean" },
    events: { items: { type: "string" }, type: "array" },
    hasSecret: { type: "boolean" },
    id: { type: "string" },
    name: { type: "string" },
    updatedAt: { type: "string" },
    url: { type: "string" },
  },
  type: "object",
} as const;

export const webhookListResponseSchema = {
  "2xx": {
    properties: {
      data: { items: webhookObjectSchema, type: "array" },
      total: { type: "number" },
    },
    required: ["data", "total"],
    type: "object",
  },
} as const;

// ---------------------------------------------------------------------------
// Media schemas
// ---------------------------------------------------------------------------

export const mediaObjectSchema = {
  properties: {
    alt: { type: "string" },
    createdAt: { type: "string" },
    filename: { type: "string" },
    folderId: { type: ["integer", "null"] },
    id: { type: "string" },
    mimeType: { type: "string" },
    originalName: { type: "string" },
    size: { type: "number" },
    updatedAt: { type: "string" },
  },
  type: "object",
} as const;

export const mediaFolderObjectSchema = {
  properties: {
    createdAt: { type: "string" },
    id: { type: "string" },
    name: { type: "string" },
    parentId: { type: ["integer", "null"] },
  },
  type: "object",
} as const;

export const mediaListResponseSchema = {
  "2xx": {
    properties: {
      data: { items: mediaObjectSchema, type: "array" },
      total: { type: "number" },
    },
    required: ["data", "total"],
    type: "object",
  },
} as const;

export const folderListResponseSchema = {
  "2xx": {
    properties: {
      data: { items: mediaFolderObjectSchema, type: "array" },
      total: { type: "number" },
    },
    required: ["data", "total"],
    type: "object",
  },
} as const;

// ---------------------------------------------------------------------------
// Activity schemas
// ---------------------------------------------------------------------------

export const activityObjectSchema = {
  properties: {
    action: { type: "string" },
    collection: { type: "string" },
    documentId: { type: "string" },
    id: { type: "string" },
    label: { type: "string" },
    timestamp: { type: "string" },
  },
  type: "object",
} as const;

export const activityListResponseSchema = {
  "2xx": {
    properties: {
      data: { items: activityObjectSchema, type: "array" },
      total: { type: "number" },
    },
    required: ["data", "total"],
    type: "object",
  },
} as const;

// ---------------------------------------------------------------------------
// Schema route schemas
// ---------------------------------------------------------------------------

export const schemaInfoObjectSchema = {
  properties: {
    fields: { items: { type: "object" }, type: "array" },
    label: { type: "string" },
    meta: { type: "object" },
    slug: { type: "string" },
    type: { enum: ["collection", "global", "component"], type: "string" },
  },
  required: ["fields", "label", "meta", "slug", "type"],
  type: "object",
} as const;

export const schemaListResponseSchema = {
  "2xx": {
    properties: {
      data: { items: schemaInfoObjectSchema, type: "array" },
    },
    required: ["data"],
    type: "object",
  },
} as const;

// ---------------------------------------------------------------------------
// Message response helper
// ---------------------------------------------------------------------------

export const messageResponseSchema = {
  properties: {
    message: { type: "string" },
  },
  required: ["message"],
  type: "object",
} as const;

// ---------------------------------------------------------------------------
// Health / setup schemas
// ---------------------------------------------------------------------------

export const hasAdminResponseSchema = {
  properties: {
    hasAdmin: { type: "boolean" },
  },
  required: ["hasAdmin"],
  type: "object",
} as const;
