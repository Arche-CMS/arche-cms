import { defineGlobal, component, dynamicZone } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    component("field_6", {
      component: "hero",
      label: "Component",
    }),
    dynamicZone("field_7", {
      components: ["hero", "cta"],
      label: "Dynamic Zone",
    }),
  ],
  label: "Component & Dynamic Zone Fields",
  slug: "component-dynamic-zone-fields",
});
