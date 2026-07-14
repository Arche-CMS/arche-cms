import type { CollectionDefinition } from "@arche-cms/types";

export function defineCollection(config: CollectionDefinition): CollectionDefinition {
  return {
    timestamps: { createdAt: true, updatedAt: true },
    ...config,
  };
}
