import { defineGlobal, arrayField, objectField, text } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    arrayField("socialLinks", {
      fields: [text("platform", { label: "Platform" }), text("url", { label: "URL" })],
      label: "Social Links",
    }),
    objectField("contactInfo", {
      fields: [text("phone", { label: "Phone" }), text("address", { label: "Address" })],
      label: "Contact Info",
    }),
  ],
  label: "Array & Object Fields",
  slug: "array-object-fields",
});
