import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface TextOutputProps {
  value: string;
}

/**
 * Component for displaying the converted text output
 */
export function TextOutput({ value }: TextOutputProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Text copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="output-text">Converted Text</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          disabled={!value}
          className="flex items-center gap-1"
        >
          <Copy className="h-4 w-4" />
          Copy
        </Button>
      </div>
      <Textarea
        id="output-text"
        value={value}
        readOnly
        placeholder="Converted text will appear here..."
        className="min-h-[200px]"
      />
    </div>
  );
}