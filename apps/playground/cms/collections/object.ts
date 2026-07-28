import { defineCollection, text, object } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    object("field", {
      fields: [text("nested", { label: "Nested" })],
      label: "Object Field",
    }),
  ],
  labels: { plural: "Object Fields", singular: "Object Field" },
  slug: "object",
});
