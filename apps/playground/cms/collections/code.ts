import { defineCollection, text, code } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    code("field", { label: "Code Field" }),
  ],
  labels: { plural: "Code Fields", singular: "Code Field" },
  slug: "code",
});
