import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldDef = {
  name: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
};

type FieldInputProps = {
  field: FieldDef;
  value: unknown;
  onChange: (value: string) => void;
  error?: string;
};

export function FieldInput({ field, value, onChange, error }: FieldInputProps) {
  const strVal = typeof value === "string" ? value : value != null ? String(value) : "";

  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <input
          id={field.name}
          type="checkbox"
          checked={strVal === "true" || strVal === "on"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      </div>
    );
  }

  if (field.type === "select" || field.type === "radio") {
    return (
      <div className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        <select
          id={field.name}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-destructive" : "border-input"}`}
        >
          <option value="">Select...</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  if (
    field.type === "textarea" ||
    field.type === "markdown" ||
    field.type === "code" ||
    field.type === "json" ||
    field.type === "richText"
  ) {
    return (
      <div className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        <textarea
          id={field.name}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          rows={field.type === "richText" || field.type === "code" ? 12 : 4}
          className={`flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-destructive" : "border-input"}`}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  const inputType = mapFieldType(field.type);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <Input
        id={field.name}
        type={inputType}
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function mapFieldType(fieldType: string): string {
  switch (fieldType) {
    case "email":
      return "email";
    case "number":
      return "number";
    case "password":
      return "password";
    case "url":
      return "url";
    case "date":
      return "date";
    case "datetime":
      return "datetime-local";
    default:
      return "text";
  }
}
