import type { CollectionDefinition } from "@altrugenix/types";

export function defineCollection(config: CollectionDefinition): CollectionDefinition {
  return {
    timestamps: { createdAt: true, updatedAt: true },
    ...config,
  };
}
