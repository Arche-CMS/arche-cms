import { defineCollection, text, select, multiSelect, radio, checkbox } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    select("status", {
      label: "Status",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
    }),
    multiSelect("tags", {
      label: "Tags",
      options: [
        { label: "Technology", value: "technology" },
        { label: "Design", value: "design" },
        { label: "Business", value: "business" },
      ],
    }),
    radio("priority", {
      label: "Priority",
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
    }),
    checkbox("published", { label: "Published" }),
  ],
  labels: { plural: "Selection Fields", singular: "Selection Field" },
  slug: "selection-fields",
});
