import { defineGlobal, color } from "@arche-cms/schema";

export default defineGlobal({
  fields: [color("field", { label: "Color Field" })],
  label: "Color Field",
  slug: "color",
});
