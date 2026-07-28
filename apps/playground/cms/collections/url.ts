import { defineCollection, text, url } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    url("field", { label: "URL Field" }),
  ],
  labels: { plural: "URL Fields", singular: "URL Field" },
  slug: "url",
});
