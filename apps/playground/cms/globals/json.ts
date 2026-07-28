import { defineGlobal, json } from "@arche-cms/schema";

export default defineGlobal({
  fields: [json("field", { label: "JSON Field" })],
  label: "JSON Field",
  slug: "json",
});
