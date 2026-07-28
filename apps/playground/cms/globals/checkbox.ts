import { defineGlobal, checkbox } from "@arche-cms/schema";

export default defineGlobal({
  fields: [checkbox("field", { label: "Checkbox Field" })],
  label: "Checkbox Field",
  slug: "checkbox",
});
