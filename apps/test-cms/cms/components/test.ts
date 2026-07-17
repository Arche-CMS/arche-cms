import { defineComponent, text } from "@arche-cms/schema";

export default defineComponent({
  slug: "test",
  label: "Test",
  fields: [text("title", { label: "Title", validation: { required: true } })],
});
