import { defineCollection, text, color } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    color("field", { label: "Color Field" }),
  ],
  labels: { plural: "Color Fields", singular: "Color Field" },
  slug: "color",
});
