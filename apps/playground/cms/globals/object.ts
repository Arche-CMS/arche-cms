import { defineGlobal, object, text } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    object("field", {
      fields: [text("nested", { label: "Nested" })],
      label: "Object Field",
    }),
  ],
  label: "Object Field",
  slug: "object",
});
