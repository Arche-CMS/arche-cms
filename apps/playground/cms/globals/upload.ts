import { defineGlobal, upload } from "@arche-cms/schema";

export default defineGlobal({
  fields: [upload("field", { label: "Upload Field" })],
  label: "Upload Field",
  slug: "upload",
});
