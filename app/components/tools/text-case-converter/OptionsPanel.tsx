import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ChevronDown, Plus, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { ConversionOptionsState } from "./types";
import { KEYBOARD_SHORTCUTS, matchesShortcut } from "./keyboard-shortcuts";
import { useReducedMotion } from "~/hooks/use-reduced-motion";

interface OptionsPanelProps {
  options: ConversionOptionsState;
  onChange: (options: ConversionOptionsState) => void;
}

/**
 * Component for configuring text conversion options
 */
export function OptionsPanel({ options, onChange }: OptionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newAlwaysCapitalize, setNewAlwaysCapitalize] = useState("");
  const [newNeverCapitalize, setNewNeverCapitalize] = useState("");
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const alwaysInputRef = useRef<HTMLInputElement>(null);
  const neverInputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Toggle options panel
  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };

  // Handle toggle for preserve acronyms
  const handleTogglePreserveAcronyms = (checked: boolean) => {
    onChange({
      ...options,
      preserveAcronyms: checked,
    });
  };

  // Add a word to the always capitalize list
  const addAlwaysCapitalize = (word: string) => {
    if (!word.trim()) return;
    
    // Don't add duplicates
    if (options.alwaysCapitalize.includes(word.trim())) return;
    
    onChange({
      ...options,
      alwaysCapitalize: [...options.alwaysCapitalize, word.trim()],
    });
    setNewAlwaysCapitalize("");
    alwaysInputRef.current?.focus();
  };

  // Remove a word from the always capitalize list
  const removeAlwaysCapitalize = (word: string) => {
    onChange({
      ...options,
      alwaysCapitalize: options.alwaysCapitalize.filter(w => w !== word),
    });
  };

  // Add a word to the never capitalize list
  const addNeverCapitalize = (word: string) => {
    if (!word.trim()) return;
    
    // Don't add duplicates
    if (options.neverCapitalize.includes(word.trim())) return;
    
    onChange({
      ...options,
      neverCapitalize: [...options.neverCapitalize, word.trim()],
    });
    setNewNeverCapitalize("");
    neverInputRef.current?.focus();
  };

  // Remove a word from the never capitalize list
  const removeNeverCapitalize = (word: string) => {
    onChange({
      ...options,
      neverCapitalize: options.neverCapitalize.filter(w => w !== word),
    });
  };

  // Handle key press for adding words
  const handleKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    type: "always" | "never"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "always") {
        addAlwaysCapitalize(newAlwaysCapitalize);
      } else {
        addNeverCapitalize(newNeverCapitalize);
      }
    }
  };

  // Register global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+O to toggle options panel
      if (matchesShortcut(e, KEYBOARD_SHORTCUTS.TOGGLE_OPTIONS)) {
        e.preventDefault();
        toggleOptions();
        
        // Focus the toggle button after opening
        if (!isOpen) {
          setTimeout(() => {
            toggleButtonRef.current?.focus();
          }, 10);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen]);

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className="w-full border rounded-md p-4"
      data-testid="options-panel"
    >
      <div className="flex items-center justify-between">
        <h3 id="advanced-options-heading" className="text-base font-medium">Advanced Options</h3>
        <CollapsibleTrigger asChild>
          <Button 
            ref={toggleButtonRef}
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8"
            aria-label={isOpen ? "Hide advanced options" : "Show advanced options"}
            aria-expanded={isOpen}
            aria-controls="advanced-options-content"
            data-testid="toggle-options"
            title={`Toggle options panel (${KEYBOARD_SHORTCUTS.TOGGLE_OPTIONS.modifier}+${KEYBOARD_SHORTCUTS.TOGGLE_OPTIONS.key})`}
          >
            <ChevronDown
              className={`h-4 w-4 ${prefersReducedMotion ? "" : "transition-transform duration-200"}`}
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
              aria-hidden="true"
            />
            <span className="sr-only">Toggle options</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent id="advanced-options-content" className="pt-4 space-y-6" aria-labelledby="advanced-options-heading">
        {/* Preserve Acronyms Option */}
        <div className="flex items-center space-x-2">
          <Switch
            id="preserve-acronyms"
            checked={options.preserveAcronyms}
            onCheckedChange={handleTogglePreserveAcronyms}
            data-testid="preserve-acronyms-switch"
            aria-describedby="preserve-acronyms-description"
          />
          <div>
            <Label htmlFor="preserve-acronyms">
              Preserve acronyms
            </Label>
            <p id="preserve-acronyms-description" className="text-xs text-muted-foreground">
              Keep acronyms like NASA, API in uppercase when using title or sentence case
            </p>
          </div>
        </div>
        
        {/* Always Capitalize Words */}
        <div className="space-y-2">
          <Label htmlFor="always-capitalize" className="text-sm font-medium">
            Always Capitalize These Words
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="always-capitalize"
              ref={alwaysInputRef}
              value={newAlwaysCapitalize}
              onChange={(e) => setNewAlwaysCapitalize(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, "always")}
              placeholder="Add word (e.g., JavaScript)"
              className="h-8"
              data-testid="always-capitalize-input"
              aria-describedby="always-capitalize-help"
            />
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => addAlwaysCapitalize(newAlwaysCapitalize)}
              disabled={!newAlwaysCapitalize.trim()}
              data-testid="add-always-capitalize"
              aria-label={`Add ${newAlwaysCapitalize || "word"} to always capitalize list`}
            >
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Add
            </Button>
          </div>
          
          <p id="always-capitalize-help" className="text-xs text-muted-foreground">
            Enter words that should always be capitalized regardless of position
          </p>
          
          {/* Word Tags */}
          <div 
            className="flex flex-wrap gap-2 mt-2"
            role="list"
            aria-label="Always capitalize words list"
          >
            {options.alwaysCapitalize.map((word) => (
              <div 
                key={word}
                className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                data-testid={`always-word-${word}`}
                role="listitem"
              >
                {word}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeAlwaysCapitalize(word)}
                  aria-label={`Remove ${word} from always capitalize list`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            ))}
            {options.alwaysCapitalize.length === 0 && (
              <span className="text-xs text-muted-foreground" role="status">No words added</span>
            )}
          </div>
        </div>
        
        {/* Never Capitalize Words */}
        <div className="space-y-2">
          <Label htmlFor="never-capitalize" className="text-sm font-medium">
            Never Capitalize These Words
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="never-capitalize"
              ref={neverInputRef}
              value={newNeverCapitalize}
              onChange={(e) => setNewNeverCapitalize(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, "never")}
              placeholder="Add word (e.g., iPhone)"
              className="h-8"
              data-testid="never-capitalize-input"
              aria-describedby="never-capitalize-help"
            />
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => addNeverCapitalize(newNeverCapitalize)}
              disabled={!newNeverCapitalize.trim()}
              data-testid="add-never-capitalize"
              aria-label={`Add ${newNeverCapitalize || "word"} to never capitalize list`}
            >
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Add
            </Button>
          </div>
          
          <p id="never-capitalize-help" className="text-xs text-muted-foreground">
            Enter words that should never be capitalized (e.g., brand names like "iPhone")
          </p>
          
          {/* Word Tags */}
          <div 
            className="flex flex-wrap gap-2 mt-2"
            role="list"
            aria-label="Never capitalize words list"
          >
            {options.neverCapitalize.map((word) => (
              <div 
                key={word}
                className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                data-testid={`never-word-${word}`}
                role="listitem"
              >
                {word}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeNeverCapitalize(word)}
                  aria-label={`Remove ${word} from never capitalize list`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            ))}
            {options.neverCapitalize.length === 0 && (
              <span className="text-xs text-muted-foreground" role="status">No words added</span>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>These options affect Title Case and Sentence Case conversions.</p>
          <p className="mt-1">
            Tip: Press <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Alt+O</kbd> to toggle this options panel.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}