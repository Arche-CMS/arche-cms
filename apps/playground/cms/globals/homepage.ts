import { defineGlobal, richText, slug, text } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    slug("slug", { label: "Slug", source: "title", validation: { required: true } }),
    richText("content", { label: "Content", validation: { required: true } }),
  ],
  label: "Homepage",
  slug: "homepage",
});
