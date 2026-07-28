import { defineGlobal, date } from "@arche-cms/schema";

export default defineGlobal({
  fields: [date("field", { label: "Date Field" })],
  label: "Date Field",
  slug: "date",
});
