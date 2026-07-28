import { defineGlobal, slug } from "@arche-cms/schema";

export default defineGlobal({
  fields: [slug("field", { label: "Slug Field" })],
  label: "Slug Field",
  slug: "slug",
});
