import { defineGlobal, media } from "@arche-cms/schema";

export default defineGlobal({
  fields: [media("field", { label: "Media Field" })],
  label: "Media Field",
  slug: "media",
});
