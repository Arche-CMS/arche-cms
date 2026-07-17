import { defineGlobal, boolean, number, text, textarea } from "@arche-cms/schema";

export default defineGlobal({
  slug: "basic-fields",
  label: "Basic Fields",
  fields: [text("field_1"), textarea("field_2"), number("field_3"), boolean("field_4")],
});
