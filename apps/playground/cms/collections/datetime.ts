import { defineCollection, text, datetime } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    datetime("field", { label: "DateTime Field" }),
  ],
  labels: { plural: "DateTime Fields", singular: "DateTime Field" },
  slug: "datetime",
});
