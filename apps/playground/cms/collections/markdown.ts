import { defineCollection, text, markdown } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    markdown("field", { label: "Markdown Field" }),
  ],
  labels: { plural: "Markdown Fields", singular: "Markdown Field" },
  slug: "markdown",
});
