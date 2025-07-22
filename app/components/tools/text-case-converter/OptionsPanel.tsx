import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ChevronDown, Plus, X } from "lucide-react";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { ConversionOptionsState } from "./types";

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

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className="w-full border rounded-md p-4"
      data-testid="options-panel"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Advanced Options</h3>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8"
            aria-label={isOpen ? "Hide advanced options" : "Show advanced options"}
            data-testid="toggle-options"
          >
            <ChevronDown
              className="h-4 w-4 transition-transform duration-200"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
            <span className="sr-only">Toggle options</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="pt-4 space-y-6">
        {/* Preserve Acronyms Option */}
        <div className="flex items-center space-x-2">
          <Switch
            id="preserve-acronyms"
            checked={options.preserveAcronyms}
            onCheckedChange={handleTogglePreserveAcronyms}
            data-testid="preserve-acronyms-switch"
          />
          <Label htmlFor="preserve-acronyms">
            Preserve acronyms (e.g., NASA, API)
          </Label>
        </div>
        
        {/* Always Capitalize Words */}
        <div className="space-y-2">
          <Label htmlFor="always-capitalize" className="text-sm font-medium">
            Always Capitalize These Words
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="always-capitalize"
              value={newAlwaysCapitalize}
              onChange={(e) => setNewAlwaysCapitalize(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, "always")}
              placeholder="Add word (e.g., JavaScript)"
              className="h-8"
              data-testid="always-capitalize-input"
            />
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => addAlwaysCapitalize(newAlwaysCapitalize)}
              disabled={!newAlwaysCapitalize.trim()}
              data-testid="add-always-capitalize"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {/* Word Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {options.alwaysCapitalize.map((word) => (
              <div 
                key={word}
                className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                data-testid={`always-word-${word}`}
              >
                {word}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeAlwaysCapitalize(word)}
                  aria-label={`Remove ${word}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {options.alwaysCapitalize.length === 0 && (
              <span className="text-xs text-muted-foreground">No words added</span>
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
              value={newNeverCapitalize}
              onChange={(e) => setNewNeverCapitalize(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, "never")}
              placeholder="Add word (e.g., iPhone)"
              className="h-8"
              data-testid="never-capitalize-input"
            />
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => addNeverCapitalize(newNeverCapitalize)}
              disabled={!newNeverCapitalize.trim()}
              data-testid="add-never-capitalize"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {/* Word Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {options.neverCapitalize.map((word) => (
              <div 
                key={word}
                className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                data-testid={`never-word-${word}`}
              >
                {word}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeNeverCapitalize(word)}
                  aria-label={`Remove ${word}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {options.neverCapitalize.length === 0 && (
              <span className="text-xs text-muted-foreground">No words added</span>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>These options affect Title Case and Sentence Case conversions.</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}