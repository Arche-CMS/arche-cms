import { defineGlobal, url } from "@arche-cms/schema";

export default defineGlobal({
  fields: [url("field", { label: "URL Field" })],
  label: "URL Field",
  slug: "url",
});
