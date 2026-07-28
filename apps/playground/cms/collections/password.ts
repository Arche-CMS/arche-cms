import { defineCollection, text, password } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    password("field", { label: "Password Field" }),
  ],
  labels: { plural: "Password Fields", singular: "Password Field" },
  slug: "password",
});
