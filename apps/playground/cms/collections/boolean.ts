import { defineCollection, text, boolean } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    boolean("field", { label: "Boolean Field" }),
  ],
  labels: { plural: "Boolean Fields", singular: "Boolean Field" },
  slug: "boolean",
});
