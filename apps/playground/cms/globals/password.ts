import { defineGlobal, password } from "@arche-cms/schema";

export default defineGlobal({
  fields: [password("field", { label: "Password Field" })],
  label: "Password Field",
  slug: "password",
});
