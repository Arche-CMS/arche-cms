import { defineGlobal, componentField, dynamicZone } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    componentField("heroBanner", { component: "seo", label: "Hero Banner" }),
    dynamicZone("pageBlocks", {
      components: ["seo", "media-card"],
      label: "Page Blocks",
    }),
  ],
  label: "Component Fields",
  slug: "component-fields",
});
