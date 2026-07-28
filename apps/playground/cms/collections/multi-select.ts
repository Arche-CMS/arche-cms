import { defineCollection, text, multiSelect } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    multiSelect("field", {
      label: "Multi-Select Field",
      options: [
        { label: "Option A", value: "option-a" },
        { label: "Option B", value: "option-b" },
        { label: "Option C", value: "option-c" },
      ],
    }),
  ],
  labels: { plural: "Multi-Select Fields", singular: "Multi-Select Field" },
  slug: "multi-select",
});
