import { useState, useEffect, useRef } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Copy, Download, Check } from "lucide-react";
import { showSuccessToast, showErrorToast } from "./toast-config";
import { KEYBOARD_SHORTCUTS, matchesShortcut } from "./keyboard-shortcuts";
import { useReducedMotion } from "~/hooks/use-reduced-motion";

interface TextOutputProps {
  value: string;
}

/**
 * Component for displaying the converted text output with copy and download functionality
 */
export function TextOutput({ value }: TextOutputProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Reset the copied state after a delay (shorter for reduced motion)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isCopied) {
      // Use a shorter timeout for users who prefer reduced motion
      const timeoutDuration = prefersReducedMotion ? 1000 : 2000;
      timeout = setTimeout(() => {
        setIsCopied(false);
      }, timeoutDuration);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isCopied, prefersReducedMotion]);

  // Track value changes for screen reader announcements
  useEffect(() => {
    setPrevValue(value);
  }, [value]);

  // Handle copying text to clipboard
  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      showSuccessToast("Text copied to clipboard");
    } catch (error) {
      showErrorToast("Failed to copy text");
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
      
      showSuccessToast("Text downloaded as file");
    } catch (error) {
      showErrorToast("Failed to download text");
    }
  };

  // Focus the output element
  const focusOutput = () => {
    outputRef.current?.focus();
  };

  // Register global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+2 to focus output
      if (matchesShortcut(e, KEYBOARD_SHORTCUTS.FOCUS_OUTPUT)) {
        e.preventDefault();
        focusOutput();
      }
      
      // Alt+C to copy
      if (matchesShortcut(e, KEYBOARD_SHORTCUTS.COPY) && value) {
        e.preventDefault();
        handleCopy();
      }
      
      // Alt+D to download
      if (matchesShortcut(e, KEYBOARD_SHORTCUTS.DOWNLOAD) && value) {
        e.preventDefault();
        handleDownload();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [value]);

  // Determine if we should announce the text change
  const shouldAnnounceChange = value !== prevValue && value.length > 0;
  
  // Create a simplified announcement for screen readers
  const getAnnouncement = () => {
    if (!value) return "No text to display";
    if (value.length <= 100) return `Converted text: ${value}`;
    return `Converted text updated. ${value.length} characters.`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="output-text" className="text-sm sm:text-base font-medium">Converted Text</Label>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!value}
            className="flex items-center gap-1 interactive-element"
            data-testid="copy-button"
            aria-label="Copy to clipboard"
            title={`Copy to clipboard (${KEYBOARD_SHORTCUTS.COPY.modifier}+${KEYBOARD_SHORTCUTS.COPY.key})`}
          >
            {isCopied ? (
              <>
                <Check 
                  className={`h-4 w-4 text-green-500 ${prefersReducedMotion ? "" : "animate-in fade-in zoom-in"}`} 
                  aria-hidden="true" 
                />
                <span className="text-xs sm:text-sm">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs sm:text-sm">Copy</span>
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={!value}
            className="flex items-center gap-1 interactive-element"
            data-testid="download-button"
            aria-label="Download as file"
            title={`Download as file (${KEYBOARD_SHORTCUTS.DOWNLOAD.modifier}+${KEYBOARD_SHORTCUTS.DOWNLOAD.key})`}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs sm:text-sm">Download</span>
          </Button>
        </div>
      </div>
      <Textarea
        id="output-text"
        ref={outputRef}
        value={value}
        readOnly
        placeholder="Converted text will appear here..."
        className="min-h-[200px] resize-y font-medium bg-muted/30 text-container text-foreground"
        style={{ fontSize: "1rem", lineHeight: "1.5" }}
        data-testid="output-textarea"
        aria-label="Converted text output"
        aria-live="polite"
      />
      
      {/* Live region for screen readers */}
      <div 
        aria-live="polite" 
        className="sr-only" 
        role="status"
      >
        {shouldAnnounceChange ? getAnnouncement() : null}
      </div>
      
      <p className="text-xs sm:text-sm text-muted-foreground max-w-full break-words">
        {value ? `${value.length} characters` : "No text to display"}
        <span className="block mt-1">
          Tip: Press <kbd className="px-1 py-0.5 text-xs sm:text-sm bg-muted border rounded">Alt+2</kbd> to focus this output field, 
          <kbd className="px-1 py-0.5 text-xs sm:text-sm bg-muted border rounded ml-1">Alt+C</kbd> to copy, or
          <kbd className="px-1 py-0.5 text-xs sm:text-sm bg-muted border rounded ml-1">Alt+D</kbd> to download.
        </span>
      </p>
    </div>
  );
}