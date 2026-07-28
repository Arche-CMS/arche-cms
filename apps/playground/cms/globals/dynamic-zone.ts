import { defineGlobal, dynamicZone } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    dynamicZone("field", {
      components: ["seo", "media-card"],
      label: "Dynamic Zone Field",
    }),
  ],
  label: "Dynamic Zone Field",
  slug: "dynamic-zone",
});
