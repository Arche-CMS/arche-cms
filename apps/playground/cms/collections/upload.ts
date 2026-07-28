import { defineCollection, text, upload } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    upload("field", { label: "Upload Field" }),
  ],
  labels: { plural: "Upload Fields", singular: "Upload Field" },
  slug: "upload",
});
