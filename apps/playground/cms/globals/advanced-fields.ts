import {
  defineGlobal,
  json,
  code,
  color,
  component,
  dynamicZone,
  array,
  object,
  tabs,
  group,
  repeater,
  text,
  richText,
} from "@arche-cms/schema";

export default defineGlobal({
  fields: [
    json("customSettings", { label: "Custom Settings (JSON)" }),
    code("customScript", { label: "Custom Script" }),
    color("primaryColor", { label: "Primary Brand Color" }),
    component("heroBanner", { component: "seo", label: "Hero Banner" }),
    dynamicZone("pageBlocks", {
      components: ["seo", "media-card"],
      label: "Page Blocks",
    }),
    array("socialLinks", {
      fields: [text("platform", { label: "Platform" }), text("url", { label: "URL" })],
      label: "Social Links",
    }),
    object("contactInfo", {
      fields: [text("phone", { label: "Phone" }), text("address", { label: "Address" })],
      label: "Contact Info",
    }),
    tabs("tabbedSettings", {
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
    group("footerSettings", {
      fields: [
        text("copyright", { label: "Copyright Text" }),
        text("footerLinks", { label: "Footer Links" }),
      ],
      label: "Footer Settings",
    }),
    repeater("testimonials", {
      fields: [text("author", { label: "Author" }), richText("quote", { label: "Quote" })],
      label: "Testimonials",
    }),
  ],
  label: "Advanced Fields",
  slug: "advanced-fields",
});
