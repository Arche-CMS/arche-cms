import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldDef = {
  name: string;
  type: string;
  label: string;
  required: boolean;
};

type FieldInputProps = {
  field: FieldDef;
  value: unknown;
  onChange: (value: string) => void;
  error?: string;
};

export function FieldInput({ field, value, onChange, error }: FieldInputProps) {
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
        value={typeof value === "string" ? value : ""}
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
    case "boolean":
      return "checkbox";
    default:
      return "text";
  }
}
