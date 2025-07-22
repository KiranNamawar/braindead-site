import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { CASE_FORMATS, CaseFormat } from "./types";
import { useReducedMotion } from "~/hooks/use-reduced-motion";

interface CaseFormatSelectorProps {
  value: CaseFormat;
  onChange: (value: CaseFormat) => void;
}

/**
 * Component for selecting the case format with enhanced visual indication and tooltips
 */
export function CaseFormatSelector({ value, onChange }: CaseFormatSelectorProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="space-y-4">
      <Label htmlFor="case-format-group" className="text-sm sm:text-base font-medium">Select Case Format</Label>
      <RadioGroup
        id="case-format-group"
        value={value}
        onValueChange={(val) => onChange(val as CaseFormat)}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        data-testid="case-format-selector"
        aria-label="Case format options"
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
                role="presentation"
              >
                <RadioGroupItem 
                  value={format.id} 
                  id={format.id} 
                  className="text-primary"
                  aria-describedby={`format-desc-${format.id}`}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label 
                      htmlFor={format.id} 
                      className={`
                        cursor-pointer text-sm sm:text-base font-medium ${prefersReducedMotion ? "" : "transition-colors"}
                        ${isActive ? 'text-primary' : 'text-foreground'}
                      `}
                    >
                      <span className="font-mono">{format.label}</span>
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-foreground bg-background">
                    <p id={`format-desc-${format.id}`} className="text-sm">{format.description}</p>
                    <p className="text-xs sm:text-sm mt-1 font-mono">Example: {format.example}</p>
                  </TooltipContent>
                </Tooltip>
                {/* Hidden description for screen readers */}
                <span id={`format-desc-${format.id}`} className="sr-only">
                  {format.description}. Example: {format.example}
                </span>
              </div>
            );
          })}
        </TooltipProvider>
      </RadioGroup>
      <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-full break-words" id="format-selector-help">
        Hover over a format for more information. Click to select a format.
      </p>
    </div>
  );
}