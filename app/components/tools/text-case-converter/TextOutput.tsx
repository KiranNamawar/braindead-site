import { useState, useEffect } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Copy, Download, Check } from "lucide-react";
import { toast } from "sonner";

interface TextOutputProps {
  value: string;
}

/**
 * Component for displaying the converted text output with copy and download functionality
 */
export function TextOutput({ value }: TextOutputProps) {
  const [isCopied, setIsCopied] = useState(false);
  
  // Reset the copied state after 2 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isCopied) {
      timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isCopied]);

  // Handle copying text to clipboard
  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      toast.success("Text copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  // Handle downloading text as a file
  const handleDownload = () => {
    if (!value) return;
    
    try {
      const blob = new Blob([value], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      // Create a timestamp for the filename
      const date = new Date();
      const timestamp = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
      
      link.href = url;
      link.download = `converted_text_${timestamp}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Text downloaded as file");
    } catch (error) {
      toast.error("Failed to download text");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="output-text" className="text-base font-medium">Converted Text</Label>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!value}
            className="flex items-center gap-1"
            data-testid="copy-button"
            aria-label="Copy to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={!value}
            className="flex items-center gap-1"
            data-testid="download-button"
            aria-label="Download as file"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <Textarea
        id="output-text"
        value={value}
        readOnly
        placeholder="Converted text will appear here..."
        className="min-h-[200px] resize-y font-medium bg-muted/30"
        data-testid="output-textarea"
        aria-label="Converted text output"
      />
      <p className="text-xs text-muted-foreground">
        {value ? `${value.length} characters` : "No text to display"}
      </p>
    </div>
  );
}