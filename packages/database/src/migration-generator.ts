import type { CollectionDefinition, FieldDefinition } from "@altrugenix/types";
import type { Migration, ExistingSchema } from "./types.js";

const fieldToSqlType: Record<string, string> = {
  text: "TEXT",
  textarea: "TEXT",
  number: "REAL",
  boolean: "INTEGER",
  date: "TEXT",
  datetime: "TEXT",
  email: "TEXT",
  password: "TEXT",
  url: "TEXT",
  json: "TEXT",
  richText: "TEXT",
  markdown: "TEXT",
  code: "TEXT",
  color: "TEXT",
  media: "TEXT",
  upload: "TEXT",
  select: "TEXT",
  multiSelect: "TEXT",
  radio: "TEXT",
  checkbox: "INTEGER",
  relation: "TEXT",
  component: "TEXT",
  dynamicZone: "TEXT",
  array: "TEXT",
  object: "TEXT",
  tabs: "TEXT",
  group: "TEXT",
  repeater: "TEXT",
  slug: "TEXT",
};

function sqlTypeForField(field: FieldDefinition): string {
  const baseType = fieldToSqlType[field.type] ?? "TEXT";
  const nullable = field.validation?.required ? " NOT NULL" : "";
  return `${baseType}${nullable}`;
}

function collectionTableName(slug: string): string {
  return `__cms_${slug.replace(/-/g, "_")}`;
}

function fieldColumnName(name: string): string {
  return name.replace(/-/g, "_");
}

export class MigrationGenerator {
  generate(collections: CollectionDefinition[], existing: ExistingSchema): Migration[] {
    const migrations: Migration[] = [];
    const now = new Date().toISOString().replace(/[:.]/g, "-");

    for (const collection of collections) {
      const tableName = collectionTableName(collection.slug);
      const existingColumns = existing.tables.get(tableName) ?? [];

      if (!existing.tables.has(tableName)) {
        migrations.push(this.createTableMigration(collection, tableName, now));
      } else {
        const newColumns = collection.fields.filter(
          (f) => !existingColumns.includes(fieldColumnName(f.name)),
        );
        if (newColumns.length > 0) {
          migrations.push(this.addColumnsMigration(collection, newColumns, tableName, now));
        }
      }
    }

    return migrations;
  }

  private createTableMigration(
    collection: CollectionDefinition,
    tableName: string,
    timestamp: string,
  ): Migration {
    const columns = collection.fields.map(
      (f) => `  ${fieldColumnName(f.name)} ${sqlTypeForField(f)}`,
    );
    const up = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n${columns.join(",\n")}\n);`;
    const down = `DROP TABLE IF EXISTS "${tableName}";`;

    return {
      id: `mig_${timestamp}_create_${collection.slug}`,
      name: `create_${collection.slug}`,
      up,
      down,
    };
  }

  private addColumnsMigration(
    collection: CollectionDefinition,
    newFields: FieldDefinition[],
    tableName: string,
    timestamp: string,
  ): Migration {
    const upLines = newFields.map(
      (f) =>
        `ALTER TABLE "${tableName}" ADD COLUMN ${fieldColumnName(f.name)} ${sqlTypeForField(f)};`,
    );
    // No reliable way to remove columns in SQLite, mark as destructive
    const downLines = newFields.map(
      (f) => `-- WARNING: Cannot automatically revert ADD COLUMN for ${fieldColumnName(f.name)}`,
    );

    return {
      id: `mig_${timestamp}_add_fields_${collection.slug}`,
      name: `add_fields_${collection.slug}`,
      up: upLines.join("\n"),
      down: downLines.join("\n"),
    };
  }
}
