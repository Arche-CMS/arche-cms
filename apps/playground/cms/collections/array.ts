import { defineCollection, text, array } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    array("field", {
      fields: [text("item", { label: "Item" })],
      label: "Array Field",
    }),
  ],
  labels: { plural: "Array Fields", singular: "Array Field" },
  slug: "array",
});
