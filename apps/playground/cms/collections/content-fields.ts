import { defineCollection, text, richText, markdown, code } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    richText("content", { label: "Content" }),
    markdown("notes", { label: "Notes (Markdown)" }),
    code("snippet", { label: "Code Snippet" }),
  ],
  labels: { plural: "Content Fields", singular: "Content Field" },
  slug: "content-fields",
});
