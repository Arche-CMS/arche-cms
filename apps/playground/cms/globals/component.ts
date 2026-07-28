import { defineGlobal, component } from "@arche-cms/schema";

export default defineGlobal({
  fields: [component("field", { component: "seo", label: "Component Field" })],
  label: "Component Field",
  slug: "component",
});
