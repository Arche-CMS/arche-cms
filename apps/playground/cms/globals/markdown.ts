import { defineGlobal, markdown } from "@arche-cms/schema";

export default defineGlobal({
  fields: [markdown("field", { label: "Markdown Field" })],
  label: "Markdown Field",
  slug: "markdown",
});
