import { defineGlobal, media, upload } from "@arche-cms/schema";

export default defineGlobal({
  slug: "media-fields",
  label: "Media Fields",
  fields: [media("field_1"), upload("field_2")],
});
