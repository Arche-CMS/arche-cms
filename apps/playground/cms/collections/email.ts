import { defineCollection, text, email } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    email("field", { label: "Email Field" }),
  ],
  labels: { plural: "Email Fields", singular: "Email Field" },
  slug: "email",
});
