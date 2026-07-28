import { defineGlobal, repeater, text } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    repeater("field", {
      fields: [text("item", { label: "Item" })],
      label: "Repeater Field",
    }),
  ],
  label: "Repeater Field",
  slug: "repeater",
});
