import type { CollectionDefinition, FieldDefinition } from "@arche-cms/types";

export interface ValidationIssue {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

function validateField(field: FieldDefinition, path: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!field.name || field.name.trim().length === 0) {
    issues.push({ path: `${path}.name`, message: "Field name is required", severity: "error" });
  }

  if (field.name && !/^[a-z][a-zA-Z0-9]*$/.test(field.name)) {
    issues.push({
      path: `${path}.name`,
      message:
        "Field name must start with a lowercase letter and contain only alphanumeric characters",
      severity: "error",
    });
  }

  if (field.type === "select" || field.type === "multiSelect" || field.type === "radio") {
    const f = field as { options?: Array<{ label: string; value: string }> };
    if (!f.options || f.options.length === 0) {
      issues.push({
        path: `${path}.options`,
        message: "Select/multiSelect/radio fields require options",
        severity: "error",
      });
    }
  }

  if (field.type === "relation") {
    const f = field as { to?: string };
    if (!f.to) {
      issues.push({
        path: `${path}.to`,
        message: "Relation field requires target collection",
        severity: "error",
      });
    }
  }

  if (field.type === "component") {
    const f = field as { component?: string };
    if (!f.component) {
      issues.push({
        path: `${path}.component`,
        message: "Component field requires component slug",
        severity: "error",
      });
    }
  }

  if (field.type === "dynamicZone") {
    const f = field as { components?: string[] };
    if (!f.components || f.components.length === 0) {
      issues.push({
        path: `${path}.components`,
        message: "Dynamic zone requires at least one component",
        severity: "error",
      });
    }
  }

  return issues;
}

function validateFields(fields: FieldDefinition[], path: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const names = new Set<string>();

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (!field) continue;
    const fieldPath = `${path}[${i}]`;

    if (names.has(field.name)) {
      issues.push({
        path: `${fieldPath}.name`,
        message: `Duplicate field name: ${field.name}`,
        severity: "error",
      });
    }
    names.add(field.name);

    issues.push(...validateField(field, fieldPath));
  }

  return issues;
}

export function validateCollection(collection: CollectionDefinition): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!collection.slug || collection.slug.trim().length === 0) {
    issues.push({ path: "slug", message: "Collection slug is required", severity: "error" });
  }

  if (collection.slug && !/^[a-z][a-z0-9_-]*$/.test(collection.slug)) {
    issues.push({
      path: "slug",
      message:
        "Collection slug must be lowercase with only letters, numbers, hyphens, and underscores",
      severity: "error",
    });
  }

  if (!collection.labels || !collection.labels.singular || !collection.labels.plural) {
    issues.push({
      path: "labels",
      message: "Collection requires singular and plural labels",
      severity: "error",
    });
  }

  if (!collection.fields || collection.fields.length === 0) {
    issues.push({
      path: "fields",
      message: "Collection requires at least one field",
      severity: "warning",
    });
  } else {
    issues.push(...validateFields(collection.fields, "fields"));
  }

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
  };
}
