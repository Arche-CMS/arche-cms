import { defineCollection, text, radio } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    radio("field", {
      label: "Radio Field",
      options: [
        { label: "Option A", value: "option-a" },
        { label: "Option B", value: "option-b" },
        { label: "Option C", value: "option-c" },
      ],
    }),
  ],
  labels: { plural: "Radio Fields", singular: "Radio Field" },
  slug: "radio",
});
