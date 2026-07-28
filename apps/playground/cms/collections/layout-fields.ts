import {
  defineCollection,
  text,
  boolean,
  select,
  richText,
  media,
  componentField,
  dynamicZone,
  arrayField,
  objectField,
  tabsField,
  groupField,
  repeater,
} from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    componentField("seo", { component: "seo", label: "SEO" }),
    componentField("mediaCard", { component: "media-card", label: "Media Card" }),
    dynamicZone("contentBlocks", {
      components: ["seo", "media-card"],
      label: "Content Blocks",
    }),
    arrayField("galleryItems", {
      fields: [text("caption", { label: "Caption" }), media("image", { label: "Image" })],
      label: "Gallery Items",
    }),
    objectField("address", {
      fields: [
        text("street", { label: "Street" }),
        text("city", { label: "City" }),
        text("state", { label: "State" }),
        text("zip", { label: "ZIP Code" }),
      ],
      label: "Address",
    }),
    tabsField("tabbedContent", {
      label: "Tabbed Content",
      tabs: [
        {
          fields: [
            text("tabTitle", { label: "Tab Title" }),
            richText("tabContent", { label: "Tab Content" }),
          ],
          label: "General",
        },
        {
          fields: [
            text("metaTitle", { label: "Meta Title" }),
            text("metaDescription", { label: "Meta Description" }),
          ],
          label: "SEO",
        },
      ],
    }),
    groupField("advancedSettings", {
      fields: [
        boolean("enableComments", { label: "Enable Comments" }),
        select("template", {
          label: "Template",
          options: [
            { label: "Default", value: "default" },
            { label: "Full Width", value: "full-width" },
            { label: "Sidebar", value: "sidebar" },
          ],
        }),
      ],
      label: "Advanced Settings",
    }),
    repeater("faqs", {
      fields: [text("question", { label: "Question" }), text("answer", { label: "Answer" })],
      label: "FAQs",
    }),
  ],
  labels: { plural: "Layout Fields", singular: "Layout Field" },
  slug: "layout-fields",
});
