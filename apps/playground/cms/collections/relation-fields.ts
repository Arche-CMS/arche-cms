import { defineCollection, text, relation } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    relation("author", { label: "Author", to: "users" }),
    relation("relatedPosts", {
      kind: "manyToMany",
      label: "Related Posts",
      to: "posts",
    }),
  ],
  labels: { plural: "Relation Fields", singular: "Relation Field" },
  slug: "relation-fields",
});
