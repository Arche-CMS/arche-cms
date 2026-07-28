import { defineCollection, text, media, upload } from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    media("featuredImage", { label: "Featured Image" }),
    media("gallery", {
      allowedTypes: ["image", "video"],
      label: "Gallery",
      multiple: true,
    }),
    upload("attachment", { label: "Attachment" }),
  ],
  labels: { plural: "Media Fields", singular: "Media Field" },
  slug: "media-fields",
});
