import { defineGlobal, tabs, text } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
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
  label: "Tabs Field",
  slug: "tabs",
});
