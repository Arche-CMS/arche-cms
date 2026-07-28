import { defineGlobal, group, text } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    group("field", {
      fields: [text("nested", { label: "Nested" })],
      label: "Group Field",
    }),
  ],
  label: "Group Field",
  slug: "group",
});
