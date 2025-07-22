import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ConversionOptionsState, DEFAULT_OPTIONS } from "./types";

interface OptionsPanelProps {
  options: ConversionOptionsState;
  onChange: (options: ConversionOptionsState) => void;
}

/**
 * Component for configuring text conversion options
 */
export function OptionsPanel({ options, onChange }: OptionsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTogglePreserveAcronyms = (checked: boolean) => {
    onChange({
      ...options,
      preserveAcronyms: checked,
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Advanced Options</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
            <ChevronDown
              className="h-4 w-4"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
            <span className="sr-only">Toggle options</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="pt-2">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="preserve-acronyms"
              checked={options.preserveAcronyms}
              onCheckedChange={handleTogglePreserveAcronyms}
            />
            <Label htmlFor="preserve-acronyms">Preserve acronyms (e.g., NASA, API)</Label>
          </div>
          {/* Additional options will be implemented in task 3.3 */}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}