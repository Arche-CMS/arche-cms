import { writeFile, unlink, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { ServerConfig } from "../config.js";
import { SchemaLoader } from "@altrugenix/schema";
import type { FieldDefinition } from "@altrugenix/types";

interface SchemaInfo {
  slug: string;
  label: string;
  type: "collection" | "global" | "component";
  fields: FieldDefinition[];
  meta: Record<string, unknown>;
}

export function registerSchemaRoutes(fastify: FastifyInstance, config: ServerConfig): void {
  const baseDir = resolve(config.schema.baseDir);

  async function loadSchemas(): Promise<SchemaInfo[]> {
    const loader = new SchemaLoader({ baseDir });
    const loaded = await loader.load();
    const result: SchemaInfo[] = [];
    for (const [, def] of loaded.collections) {
      const d = def as unknown as Record<string, unknown>;
      const labels = d.labels as { singular?: string; plural?: string } | undefined;
      result.push({
        slug: def.slug,
        label: labels?.singular ?? def.slug,
        type: "collection",
        fields: def.fields,
        meta: { labels, timestamps: d.timestamps },
      });
    }
    for (const [, def] of loaded.globals) {
      const d = def as unknown as Record<string, unknown>;
      const label = d.label as string | undefined;
      result.push({
        slug: def.slug,
        label: label ?? def.slug,
        type: "global",
        fields: def.fields,
        meta: { label },
      });
    }
    for (const [, def] of loaded.components) {
      const d = def as unknown as Record<string, unknown>;
      const label = d.label as string | undefined;
      result.push({
        slug: def.slug,
        label: label ?? def.slug,
        type: "component",
        fields: def.fields,
        meta: { label },
      });
    }
    return result;
  }

  // GET /api/schemas — list all schemas
  fastify.get(
    "/api/schemas",
    { preHandler: [fastify.authenticate] },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const schemas = await loadSchemas();
        return reply.send({ data: schemas });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load schemas";
        return reply.status(500).send({ error: msg });
      }
    },
  );

  // GET /api/schemas/:type/:slug — get a single schema
  fastify.get(
    "/api/schemas/:type/:slug",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { type, slug } = request.params as { type: string; slug: string };
        const schemas = await loadSchemas();
        const schema = schemas.find((s) => s.type === type && s.slug === slug);
        if (!schema) return reply.status(404).send({ error: "Schema not found" });
        return reply.send(schema);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load schema";
        return reply.status(500).send({ error: msg });
      }
    },
  );

  // helpers for code generation
  const FIELD_HELPER_MAP: Record<string, string> = {
    text: "text",
    textarea: "textarea",
    number: "number",
    boolean: "boolean",
    date: "date",
    datetime: "datetime",
    email: "email",
    password: "password",
    url: "url",
    json: "json",
    richText: "richText",
    markdown: "markdown",
    code: "code",
    color: "color",
    media: "media",
    upload: "upload",
    select: "select",
    multiSelect: "multiSelect",
    radio: "radio",
    checkbox: "checkbox",
    relation: "relation",
    component: "component",
    dynamicZone: "dynamicZone",
    slug: "slug",
  };

  function serializeValidation(val: Record<string, unknown> | undefined): string {
    if (!val || Object.keys(val).length === 0) return "";
    const entries = Object.entries(val).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "";
    return `{ ${entries.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ")} }`;
  }

  function serializeAdmin(admin: Record<string, unknown> | undefined): string {
    if (!admin || Object.keys(admin).length === 0) return "";
    const entries = Object.entries(admin).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "";
    return `{ ${entries.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ")} }`;
  }

  function serializeFieldOptions(field: FieldDefinition): string {
    const parts: string[] = [];
    const f = field as unknown as Record<string, unknown>;
    if (f.label) parts.push(`label: ${JSON.stringify(f.label)}`);
    if (f.localized) parts.push("localized: true");
    if (f.defaultValue !== undefined) parts.push(`defaultValue: ${JSON.stringify(f.defaultValue)}`);
    const validation = f.validation as Record<string, unknown> | undefined;
    if (validation && Object.keys(validation).length > 0) {
      const v = serializeValidation(validation);
      if (v) parts.push(`validation: ${v}`);
    }
    const adminOpts = f.admin as Record<string, unknown> | undefined;
    if (adminOpts && Object.keys(adminOpts).length > 0) {
      const a = serializeAdmin(adminOpts);
      if (a) parts.push(`admin: ${a}`);
    }

    // Type-specific options
    if (field.type === "relation") {
      const rf = field as { to?: string; kind?: string };
      if (rf.to) parts.push(`to: ${JSON.stringify(rf.to)}`);
      if (rf.kind) parts.push(`kind: ${JSON.stringify(rf.kind)}`);
    }
    if (field.type === "component") {
      const cf = field as { component?: string; repeatable?: boolean };
      if (cf.component) parts.push(`component: ${JSON.stringify(cf.component)}`);
      if (cf.repeatable !== undefined) parts.push(`repeatable: ${String(cf.repeatable)}`);
    }
    if (field.type === "dynamicZone") {
      const df = field as { components?: string[] };
      if (df.components) parts.push(`components: ${JSON.stringify(df.components)}`);
    }
    if (field.type === "slug") {
      const sf = field as { source?: string; unique?: boolean };
      if (sf.source) parts.push(`source: ${JSON.stringify(sf.source)}`);
      if (sf.unique !== undefined) parts.push(`unique: ${String(sf.unique)}`);
    }
    if (field.type === "code") {
      const cf = field as { language?: string };
      if (cf.language) parts.push(`language: ${JSON.stringify(cf.language)}`);
    }
    if (field.type === "color") {
      const cf = field as { format?: string };
      if (cf.format) parts.push(`format: ${JSON.stringify(cf.format)}`);
    }
    if (field.type === "media" || field.type === "upload") {
      const mf = field as { multiple?: boolean; allowedTypes?: string[] };
      if (mf.multiple !== undefined) parts.push(`multiple: ${String(mf.multiple)}`);
      if (mf.allowedTypes) parts.push(`allowedTypes: ${JSON.stringify(mf.allowedTypes)}`);
    }

    // Nested fields (array, object, group, repeater)
    if (["array", "object", "group", "repeater"].includes(field.type)) {
      const nf = field as { fields?: FieldDefinition[] };
      if (nf.fields && nf.fields.length > 0) {
        parts.push(`fields: [${nf.fields.map((f) => generateFieldCode(f)).join(", ")}]`);
      }
    }

    // tabs
    if (field.type === "tabs") {
      const tf = field as { tabs?: Array<{ label: string; fields: FieldDefinition[] }> };
      if (tf.tabs && tf.tabs.length > 0) {
        const tabsCode = tf.tabs
          .map(
            (t) =>
              `{ label: ${JSON.stringify(t.label)}, fields: [${t.fields.map((f) => generateFieldCode(f)).join(", ")}] }`,
          )
          .join(", ");
        parts.push(`tabs: [${tabsCode}]`);
      }
    }

    // select/multiSelect/radio options
    if (field.type === "select" || field.type === "multiSelect" || field.type === "radio") {
      const sf = field as { options?: Array<{ label: string; value: string } | string> };
      if (sf.options && sf.options.length > 0) {
        const optsCode = sf.options
          .map((o) => {
            if (typeof o === "string") return JSON.stringify(o);
            return `{ label: ${JSON.stringify(o.label)}, value: ${JSON.stringify(o.value)} }`;
          })
          .join(", ");
        parts.push(`options: [${optsCode}]`);
      }
    }

    return parts.length > 0 ? `{ ${parts.join(", ")} }` : "";
  }

  function generateFieldCode(field: FieldDefinition): string {
    const helper = FIELD_HELPER_MAP[field.type];
    if (!helper) return "";
    const opts = serializeFieldOptions(field);
    if (opts) {
      return `${helper}(${JSON.stringify(field.name)}, ${opts})`;
    }
    return `${helper}(${JSON.stringify(field.name)})`;
  }

  function getUsedHelpers(fields: FieldDefinition[]): Set<string> {
    const helpers = new Set<string>();
    for (const f of fields) {
      const helper = FIELD_HELPER_MAP[f.type];
      if (helper) helpers.add(helper);
      if (["array", "object", "group", "repeater"].includes(f.type)) {
        const nf = f as { fields?: FieldDefinition[] };
        if (nf.fields) {
          const nested = getUsedHelpers(nf.fields);
          nested.forEach((h) => helpers.add(h));
        }
      }
      if (f.type === "tabs") {
        const tf = f as { tabs?: Array<{ label: string; fields: FieldDefinition[] }> };
        if (tf.tabs) {
          for (const t of tf.tabs) {
            const nested = getUsedHelpers(t.fields);
            nested.forEach((h) => helpers.add(h));
          }
        }
      }
    }
    return helpers;
  }

  function generateSchemaCode(
    type: string,
    slug: string,
    fields: FieldDefinition[],
    meta: Record<string, unknown>,
  ): string {
    const helpers = getUsedHelpers(fields);
    const helperList = Array.from(helpers).sort();
    const importStmt = `import { define${type === "global" ? "Global" : type === "component" ? "Component" : "Collection"}${helperList.length > 0 ? ", " + helperList.join(", ") : ""} } from "@altrugenix/schema";`;

    const defineFn =
      type === "global"
        ? "defineGlobal"
        : type === "component"
          ? "defineComponent"
          : "defineCollection";

    const metaProps: string[] = [];
    if (type === "collection") {
      const labels = meta.labels as { singular?: string; plural?: string } | undefined;
      if (labels) {
        metaProps.push(`labels: ${JSON.stringify(labels)}`);
      }
    }
    if (type === "global" && meta.label) {
      metaProps.push(`label: ${JSON.stringify(meta.label)}`);
    }
    if (type === "component" && meta.label) {
      metaProps.push(`label: ${JSON.stringify(meta.label)}`);
    }

    const fieldsCode = fields.map((f) => generateFieldCode(f)).join(",\n    ");

    return `${importStmt}\n\nexport default ${defineFn}({\n  slug: ${JSON.stringify(slug)},${metaProps.length > 0 ? `\n  ${metaProps.join(",\n  ")},` : ""}\n  fields: [\n    ${fieldsCode},\n  ],\n});\n`;
  }

  // POST /api/schemas/:type — create a new schema
  fastify.post(
    "/api/schemas/:type",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { type } = request.params as { type: string };
        const body = request.body as {
          slug: string;
          fields?: FieldDefinition[];
          meta?: Record<string, unknown>;
          label?: string;
        };

        if (!body.slug) {
          return reply.status(400).send({ error: "slug is required" });
        }
        if (!["collection", "global", "component"].includes(type)) {
          return reply.status(400).send({ error: "type must be collection, global, or component" });
        }

        const dirMap: Record<string, string> = {
          collection: "collections",
          global: "globals",
          component: "components",
        };
        const dir = dirMap[type];
        if (!dir) {
          return reply.status(400).send({ error: "type must be collection, global, or component" });
        }
        const targetDir = resolve(baseDir, dir);
        if (!existsSync(targetDir)) {
          await mkdir(targetDir, { recursive: true });
        }

        const filePath = resolve(targetDir, `${body.slug}.ts`);
        if (existsSync(filePath)) {
          return reply.status(409).send({ error: `Schema ${body.slug} already exists` });
        }

        const label = body.label ?? body.slug;
        const meta: Record<string, unknown> = { ...(body.meta ?? {}), label };
        if (type === "collection") {
          meta.labels = meta.labels ?? { singular: label, plural: `${label}s` };
        }

        const code = generateSchemaCode(type, body.slug, body.fields ?? [], meta);
        await writeFile(filePath, code, "utf-8");

        return reply.status(201).send({ message: "Schema created", slug: body.slug, type });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to create schema";
        return reply.status(500).send({ error: msg });
      }
    },
  );

  // PUT /api/schemas/:type/:slug — update an existing schema
  fastify.put(
    "/api/schemas/:type/:slug",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { type, slug } = request.params as { type: string; slug: string };
        const body = request.body as {
          fields?: FieldDefinition[];
          meta?: Record<string, unknown>;
          label?: string;
        };

        const dirMap: Record<string, string> = {
          collection: "collections",
          global: "globals",
          component: "components",
        };
        const dir = dirMap[type];
        if (!dir) {
          return reply.status(400).send({ error: "type must be collection, global, or component" });
        }
        const filePath = resolve(baseDir, dir, `${slug}.ts`);
        if (!existsSync(filePath)) {
          return reply.status(404).send({ error: "Schema not found" });
        }

        const label = body.label ?? slug;
        const meta: Record<string, unknown> = { ...(body.meta ?? {}), label };
        if (type === "collection") {
          meta.labels = meta.labels ?? { singular: label, plural: `${label}s` };
        }

        const code = generateSchemaCode(type, slug, body.fields ?? [], meta);
        await writeFile(filePath, code, "utf-8");

        return reply.send({ message: "Schema saved", slug, type });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to save schema";
        return reply.status(500).send({ error: msg });
      }
    },
  );

  // DELETE /api/schemas/:type/:slug — delete a schema file
  fastify.delete(
    "/api/schemas/:type/:slug",
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { type, slug } = request.params as { type: string; slug: string };
        const dirMap: Record<string, string> = {
          collection: "collections",
          global: "globals",
          component: "components",
        };
        const dir = dirMap[type];
        if (!dir) {
          return reply.status(400).send({ error: "type must be collection, global, or component" });
        }
        const filePath = resolve(baseDir, dir, `${slug}.ts`);
        if (!existsSync(filePath)) {
          return reply.status(404).send({ error: "Schema not found" });
        }
        await unlink(filePath);
        return reply.send({ message: "Schema deleted", slug, type });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to delete schema";
        return reply.status(500).send({ error: msg });
      }
    },
  );
}
