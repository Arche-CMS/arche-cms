import { defineCollection, text, checkbox } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    checkbox("field", { label: "Checkbox Field" }),
  ],
  labels: { plural: "Checkbox Fields", singular: "Checkbox Field" },
  slug: "checkbox",
});
