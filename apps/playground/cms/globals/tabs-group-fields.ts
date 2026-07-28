import { defineGlobal, tabsField, groupField, text, richText, code, json } from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    tabsField("tabbedSettings", {
      label: "Tabbed Settings",
      tabs: [
        {
          fields: [
            text("tagline", { label: "Tagline" }),
            richText("welcomeMessage", { label: "Welcome Message" }),
          ],
          label: "General",
        },
        {
          fields: [
            code("customCss", { label: "Custom CSS" }),
            json("featureFlags", { label: "Feature Flags" }),
          ],
          label: "Advanced",
        },
      ],
    }),
    groupField("footerSettings", {
      fields: [
        text("copyright", { label: "Copyright Text" }),
        text("footerLinks", { label: "Footer Links" }),
      ],
      label: "Footer Settings",
    }),
  ],
  label: "Tabs & Group Fields",
  slug: "tabs-group-fields",
});
