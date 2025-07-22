import { useState, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Eraser } from "lucide-react";
import { KEYBOARD_SHORTCUTS, matchesShortcut } from "./keyboard-shortcuts";
import { useReducedMotion } from "~/hooks/use-reduced-motion";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Text input component for the case converter with real-time input handling
 */
export function TextInput({ value, onChange }: TextInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle input changes in real-time
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Clear the input text
  const handleClear = () => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  };

  // Focus the input element
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    // Alt+Delete to clear input
    if (matchesShortcut(e.nativeEvent, KEYBOARD_SHORTCUTS.CLEAR)) {
      e.preventDefault();
      handleClear();
    }
  };

  // Expose the focus method to parent components
  useEffect(() => {
    // Register this component with a global keyboard shortcut handler
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (matchesShortcut(e, KEYBOARD_SHORTCUTS.FOCUS_INPUT)) {
        e.preventDefault();
        focusInput();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="input-text" className="text-sm sm:text-base font-medium">Input Text</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={!localValue}
          className="h-8 px-2 text-xs sm:text-sm interactive-element"
          aria-label="Clear input text"
          title={`Clear input (${KEYBOARD_SHORTCUTS.CLEAR.modifier}+${KEYBOARD_SHORTCUTS.CLEAR.key})`}
        >
          <Eraser className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          Clear
        </Button>
      </div>
      <Textarea
        id="input-text"
        ref={inputRef}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type or paste your text here... (e.g., 'Convert this text to UPPERCASE')"
        className={`min-h-[200px] resize-y font-medium text-container ${
          prefersReducedMotion ? "" : "transition-all"
        } focus-visible:ring-2 text-foreground bg-background`}
        style={{ fontSize: "1rem", lineHeight: "1.5" }}
        aria-label="Text to convert"
        aria-describedby="input-text-help"
        data-testid="text-input"
      />
      <p id="input-text-help" className="text-xs sm:text-sm text-muted-foreground max-w-full break-words">
        Enter any text to convert it to your selected case format. The converter handles multi-line text and preserves line breaks.
        <span className="block mt-1">
          Tip: Press <kbd className="px-1 py-0.5 text-xs sm:text-sm bg-muted border rounded">Alt+1</kbd> to focus this input field.
        </span>
      </p>
      
      {/* Status for screen readers when text is cleared */}
      {!localValue && (
        <div className="sr-only" aria-live="polite" role="status">
          Input text cleared
        </div>
      )}
    </div>
  );
}