import { defineGlobal, email, markdown, password, richText, slug, url } from "@arche-cms/schema";

export default defineGlobal({
  slug: "text-fields",
  label: "Text Fields",
  fields: [
    email("field_1"),
    password("field_2"),
    url("field_3"),
    richText("field_4"),
    markdown("field_5"),
    slug("field_6"),
  ],
});
