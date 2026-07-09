# Field Types

Altrugenix CMS provides 30 field types covering a wide range of content modeling needs.

## Text & Rich Content

| Field      | Import               | Description                                           |
| ---------- | -------------------- | ----------------------------------------------------- |
| `text`     | `@altrugenix/schema` | Single-line text input                                |
| `textarea` | `@altrugenix/schema` | Multi-line text area                                  |
| `richText` | `@altrugenix/schema` | Rich text editor (Tiptap-based)                       |
| `markdown` | `@altrugenix/schema` | Markdown editor                                       |
| `code`     | `@altrugenix/schema` | Code editor with syntax highlighting                  |
| `slug`     | `@altrugenix/schema` | URL-friendly slug, auto-generated from a source field |

## Numeric & Boolean

| Field      | Import               | Description                      |
| ---------- | -------------------- | -------------------------------- |
| `number`   | `@altrugenix/schema` | Numeric input (integer or float) |
| `boolean`  | `@altrugenix/schema` | True/false toggle                |
| `checkbox` | `@altrugenix/schema` | Single checkbox                  |

## Date & Time

| Field      | Import               | Description              |
| ---------- | -------------------- | ------------------------ |
| `date`     | `@altrugenix/schema` | Date picker (YYYY-MM-DD) |
| `datetime` | `@altrugenix/schema` | Date and time picker     |

## Media & Files

| Field    | Import               | Description               |
| -------- | -------------------- | ------------------------- |
| `media`  | `@altrugenix/schema` | Single media/file upload  |
| `upload` | `@altrugenix/schema` | Multiple file upload      |
| `image`  | `@altrugenix/schema` | Image picker with preview |

## Choice Fields

| Field         | Import               | Description            |
| ------------- | -------------------- | ---------------------- |
| `select`      | `@altrugenix/schema` | Single-select dropdown |
| `multiSelect` | `@altrugenix/schema` | Multi-select dropdown  |
| `radio`       | `@altrugenix/schema` | Radio button group     |

## Relational

| Field      | Import               | Description                     |
| ---------- | -------------------- | ------------------------------- |
| `relation` | `@altrugenix/schema` | Reference to another collection |

## Structured

| Field         | Import               | Description                                      |
| ------------- | -------------------- | ------------------------------------------------ |
| `component`   | `@altrugenix/schema` | Reusable component instance                      |
| `dynamicZone` | `@altrugenix/schema` | Dynamic zone (choose one of multiple components) |
| `array`       | `@altrugenix/schema` | Array of sub-fields                              |
| `object`      | `@altrugenix/schema` | Grouped sub-fields                               |
| `group`       | `@altrugenix/schema` | Named field group                                |
| `tabs`        | `@altrugenix/schema` | Tabbed interface for organizing fields           |
| `repeater`    | `@altrugenix/schema` | Repeatable set of fields                         |

## Utility

| Field      | Import               | Description                 |
| ---------- | -------------------- | --------------------------- |
| `email`    | `@altrugenix/schema` | Email input with validation |
| `password` | `@altrugenix/schema` | Password input              |
| `url`      | `@altrugenix/schema` | URL input with validation   |
| `json`     | `@altrugenix/schema` | JSON editor                 |
| `color`    | `@altrugenix/schema` | Color picker                |

## Validation

Each field supports validation options:

```ts
text("title", {
  validation: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: "^[a-zA-Z0-9 ]+$",
  },
});

number("age", {
  validation: {
    required: true,
    min: 0,
    max: 150,
  },
});
```

## Complete Example

```ts
import {
  defineCollection,
  text,
  number,
  boolean,
  date,
  email,
  url,
  json,
  richText,
  markdown,
  code,
  color,
  media,
  select,
  multiSelect,
  radio,
  checkbox,
  relation,
  component,
  dynamicZone,
  array,
  object,
  group,
  repeater,
  slug,
  password,
  tabs,
} from "@altrugenix/schema";

export default defineCollection({
  slug: "examples",
  labels: { singular: "Example", plural: "Examples" },
  fields: [
    text("title", { validation: { required: true } }),
    textarea("description"),
    number("order", { validation: { min: 0 } }),
    boolean("featured"),
    date("publishDate"),
    email("contactEmail"),
    url("website"),
    json("metadata"),
    richText("content"),
    markdown("readme"),
    code("snippet", { language: "typescript" }),
    color("accentColor"),
    media("coverImage"),
    upload("gallery"),
    select("status", { options: ["draft", "published", "archived"] }),
    multiSelect("tags", { options: ["news", "tech", "design"] }),
    radio("layout", { options: ["default", "full-width", "compact"] }),
    checkbox("showInMenu"),
    relation("author", { to: "users" }),
    component("seo", { component: "seo" }),
    dynamicZone("blocks", { components: ["hero", "cta", "faq"] }),
    array("links", { fields: [text("label"), url("url")] }),
    object("settings", { fields: [text("theme"), boolean("darkMode")] }),
    group("social", { fields: [url("twitter"), url("github")] }),
    tabs("details", { tabs: [{ label: "Content", fields: ["title", "body"] }] }),
    repeater("faq", { fields: [text("question"), textarea("answer")] }),
    slug("slug", { from: "title" }),
    password("secretKey"),
  ],
});
```
