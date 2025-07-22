import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { CASE_FORMATS, CaseFormat } from "./types";

interface CaseFormatSelectorProps {
  value: CaseFormat;
  onChange: (value: CaseFormat) => void;
}

/**
 * Component for selecting the case format
 */
export function CaseFormatSelector({ value, onChange }: CaseFormatSelectorProps) {
  return (
    <div className="space-y-4">
      <Label>Select Case Format</Label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as CaseFormat)}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
      >
        <TooltipProvider>
          {CASE_FORMATS.map((format) => (
            <div key={format.id} className="flex items-center space-x-2">
              <RadioGroupItem value={format.id} id={format.id} />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor={format.id} className="cursor-pointer">
                    {format.label}
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format.description}</p>
                  <p className="text-xs mt-1">Example: {format.example}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      </RadioGroup>
    </div>
  );
}