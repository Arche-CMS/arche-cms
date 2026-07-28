import { defineCollection, text, relation } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    relation("field", { label: "Relation Field", to: "users" }),
  ],
  labels: { plural: "Relation Fields", singular: "Relation Field" },
  slug: "relation",
});
