import { defineCollection, text, slug } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    slug("field", { label: "Slug Field", source: "title" }),
  ],
  labels: { plural: "Slug Fields", singular: "Slug Field" },
  slug: "slug-collection",
});
