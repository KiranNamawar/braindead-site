import { useState, useEffect, useRef } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  debounceTime?: number;
}

/**
 * Text input component for the case converter with debounced input handling
 */
export function TextInput({ value, onChange, debounceTime = 300 }: TextInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Handle input changes with debouncing
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set a new timer
    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceTime);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="input-text">Input Text</Label>
      <Textarea
        id="input-text"
        value={localValue}
        onChange={handleChange}
        placeholder="Type or paste your text here... (e.g., 'Convert this text to UPPERCASE')"
        className="min-h-[200px] resize-y font-medium transition-all focus-visible:ring-2"
        aria-label="Text to convert"
        data-testid="text-input"
      />
      <p className="text-xs text-muted-foreground">
        Enter any text to convert it to your selected case format. The converter handles multi-line text and preserves line breaks.
      </p>
    </div>
  );
}