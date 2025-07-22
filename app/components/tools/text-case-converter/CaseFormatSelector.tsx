import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { CASE_FORMATS, CaseFormat } from "./types";

interface CaseFormatSelectorProps {
  value: CaseFormat;
  onChange: (value: CaseFormat) => void;
}

/**
 * Component for selecting the case format with enhanced visual indication and tooltips
 */
export function CaseFormatSelector({ value, onChange }: CaseFormatSelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Select Case Format</Label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as CaseFormat)}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        data-testid="case-format-selector"
      >
        <TooltipProvider delayDuration={300}>
          {CASE_FORMATS.map((format) => {
            const isActive = value === format.id;
            
            return (
              <div 
                key={format.id} 
                className={`
                  flex items-center space-x-2 p-2 rounded-md border transition-all
                  ${isActive 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-transparent hover:bg-accent'
                  }
                `}
                data-testid={`format-option-${format.id}`}
                data-active={isActive}
              >
                <RadioGroupItem 
                  value={format.id} 
                  id={format.id} 
                  className="text-primary"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label 
                      htmlFor={format.id} 
                      className={`
                        cursor-pointer text-sm font-medium transition-colors
                        ${isActive ? 'text-primary' : 'text-foreground'}
                      `}
                    >
                      <span className="font-mono">{format.label}</span>
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>{format.description}</p>
                    <p className="text-xs mt-1 font-mono">Example: {format.example}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </TooltipProvider>
      </RadioGroup>
      <p className="text-xs text-muted-foreground mt-2">
        Hover over a format for more information. Click to select a format.
      </p>
    </div>
  );
}