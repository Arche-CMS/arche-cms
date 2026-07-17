import { defineGlobal, date, datetime } from "@arche-cms/schema";

export default defineGlobal({
  slug: "date-fields",
  label: "Date Fields",
  fields: [date("field_1"), datetime("field_2")],
});
