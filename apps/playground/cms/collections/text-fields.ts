import {
  defineCollection,
  text,
  textarea,
  number,
  boolean,
  date,
  datetime,
  email,
  password,
  url,
  json,
  color,
  slug,
} from "@arche-cms/schema";

export default defineCollection({
  fields: [
    text("title", { label: "Title", validation: { required: true } }),
    textarea("excerpt", { label: "Excerpt" }),
    number("order", { label: "Order" }),
    boolean("featured", { label: "Featured" }),
    date("publishDate", { label: "Publish Date" }),
    datetime("scheduledAt", { label: "Scheduled At" }),
    email("contactEmail", { label: "Contact Email" }),
    password("secretKey", { label: "Secret Key" }),
    url("website", { label: "Website URL" }),
    json("metadata", { label: "Metadata" }),
    color("brandColor", { label: "Brand Color" }),
    slug("slug", { label: "Slug", source: "title", validation: { required: true } }),
  ],
  labels: { plural: "Text Fields", singular: "Text Field" },
  slug: "text-fields",
});
