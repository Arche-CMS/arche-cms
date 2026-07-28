import { defineCollection, text, textarea } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    textarea("field", { label: "Textarea Field" }),
  ],
  labels: { plural: "Textarea Fields", singular: "Textarea Field" },
  slug: "textarea",
});
