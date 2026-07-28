import { defineGlobal, relation } from "@arche-cms/schema";

export default defineGlobal({
  fields: [relation("field", { label: "Relation Field", to: "users" })],
  label: "Relation Field",
  slug: "relation",
});
