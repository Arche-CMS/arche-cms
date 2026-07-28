import { defineGlobal, number } from "@arche-cms/schema";

export default defineGlobal({
  fields: [number("field", { label: "Number Field" })],
  label: "Number Field",
  slug: "number",
});
