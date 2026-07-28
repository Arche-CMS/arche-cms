import { defineCollection, text, tabs } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    tabs("field", {
      label: "Tabs Field",
      tabs: [
        {
          fields: [text("tab1Field", { label: "Tab 1 Field" })],
          label: "Tab 1",
        },
        {
          fields: [text("tab2Field", { label: "Tab 2 Field" })],
          label: "Tab 2",
        },
      ],
    }),
  ],
  labels: { plural: "Tabs Fields", singular: "Tabs Field" },
  slug: "tabs",
});
