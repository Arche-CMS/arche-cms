export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "password"
  | "url"
  | "json"
  | "richText"
  | "markdown"
  | "code"
  | "color"
  | "media"
  | "upload"
  | "select"
  | "multiSelect"
  | "radio"
  | "checkbox"
  | "relation"
  | "component"
  | "dynamicZone"
  | "array"
  | "object"
  | "tabs"
  | "group"
  | "repeater"
  | "slug";

export interface FieldValidation {
  required?: boolean;
  unique?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
  custom?: (value: unknown) => boolean | string;
}

export interface FieldBase {
  name: string;
  type: FieldType;
  label?: string;
  localized?: boolean;
  defaultValue?: unknown;
  validation?: FieldValidation;
  admin?: {
    description?: string;
    placeholder?: string;
    hidden?: boolean;
    readOnly?: boolean;
    order?: number;
    width?: string;
  };
}

export interface TextField extends FieldBase {
  type: "text";
}

export interface TextareaField extends FieldBase {
  type: "textarea";
}

export interface NumberField extends FieldBase {
  type: "number";
}

export interface BooleanField extends FieldBase {
  type: "boolean";
}

export interface DateField extends FieldBase {
  type: "date";
}

export interface DateTimeField extends FieldBase {
  type: "datetime";
}

export interface EmailField extends FieldBase {
  type: "email";
}

export interface PasswordField extends FieldBase {
  type: "password";
}

export interface UrlField extends FieldBase {
  type: "url";
}

export interface JsonField extends FieldBase {
  type: "json";
}

export interface RichTextField extends FieldBase {
  type: "richText";
}

export interface MarkdownField extends FieldBase {
  type: "markdown";
}

export interface CodeField extends FieldBase {
  type: "code";
  language?: string;
}

export interface ColorField extends FieldBase {
  type: "color";
  format?: "hex" | "rgb" | "rgba" | "hsl";
}

export interface MediaField extends FieldBase {
  type: "media";
  multiple?: boolean;
  allowedTypes?: Array<"image" | "video" | "audio" | "document">;
}

export interface UploadField extends FieldBase {
  type: "upload";
  multiple?: boolean;
  allowedTypes?: Array<"image" | "video" | "audio" | "document">;
}

export interface SelectField extends FieldBase {
  type: "select";
  options: Array<{ label: string; value: string }>;
}

export interface MultiSelectField extends FieldBase {
  type: "multiSelect";
  options: Array<{ label: string; value: string }>;
}

export interface RadioField extends FieldBase {
  type: "radio";
  options: Array<{ label: string; value: string }>;
}

export interface CheckboxField extends FieldBase {
  type: "checkbox";
}

export interface RelationField extends FieldBase {
  type: "relation";
  to: string;
  kind?: "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany";
}

export interface ComponentField extends FieldBase {
  type: "component";
  component: string;
  repeatable?: boolean;
}

export interface DynamicZoneField extends FieldBase {
  type: "dynamicZone";
  components: string[];
}

export interface ArrayField extends FieldBase {
  type: "array";
  fields: FieldDefinition[];
}

export interface ObjectField extends FieldBase {
  type: "object";
  fields: FieldDefinition[];
}

export interface TabsField extends FieldBase {
  type: "tabs";
  tabs: Array<{ label: string; fields: FieldDefinition[] }>;
}

export interface GroupField extends FieldBase {
  type: "group";
  fields: FieldDefinition[];
}

export interface RepeaterField extends FieldBase {
  type: "repeater";
  fields: FieldDefinition[];
}

export interface SlugField extends FieldBase {
  type: "slug";
  source?: string;
  unique?: boolean;
}

export type FieldDefinition =
  | TextField
  | TextareaField
  | NumberField
  | BooleanField
  | DateField
  | DateTimeField
  | EmailField
  | PasswordField
  | UrlField
  | JsonField
  | RichTextField
  | MarkdownField
  | CodeField
  | ColorField
  | MediaField
  | UploadField
  | SelectField
  | MultiSelectField
  | RadioField
  | CheckboxField
  | RelationField
  | ComponentField
  | DynamicZoneField
  | ArrayField
  | ObjectField
  | TabsField
  | GroupField
  | RepeaterField
  | SlugField;
