import { defineGlobal, array, text } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    array("field", {
      fields: [text("item", { label: "Item" })],
      label: "Array Field",
    }),
  ],
  label: "Array Field",
  slug: "array",
});
