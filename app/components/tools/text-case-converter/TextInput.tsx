import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Text input component for the case converter
 */
export function TextInput({ value, onChange }: TextInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="input-text">Input Text</Label>
      <Textarea
        id="input-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter text to convert..."
        className="min-h-[200px]"
      />
    </div>
  );
}