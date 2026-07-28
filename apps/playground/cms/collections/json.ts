import { defineCollection, text, json } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    json("field", { label: "JSON Field" }),
  ],
  labels: { plural: "JSON Fields", singular: "JSON Field" },
  slug: "json",
});
