import { defineGlobal, json, code, color } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    json("customSettings", { label: "Custom Settings (JSON)" }),
    code("customScript", { label: "Custom Script" }),
    color("primaryColor", { label: "Primary Brand Color" }),
  ],
  label: "Code & Color Fields",
  slug: "code-color-fields",
});
