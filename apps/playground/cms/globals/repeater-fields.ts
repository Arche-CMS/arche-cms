import { defineGlobal, repeater, text, richText } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    repeater("testimonials", {
      fields: [text("author", { label: "Author" }), richText("quote", { label: "Quote" })],
      label: "Testimonials",
    }),
  ],
  label: "Repeater Fields",
  slug: "repeater-fields",
});
