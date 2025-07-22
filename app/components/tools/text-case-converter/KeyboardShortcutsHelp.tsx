import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { KEYBOARD_SHORTCUTS, formatShortcut } from "./keyboard-shortcuts";
import { useReducedMotion } from "~/hooks/use-reduced-motion";

/**
 * Component that displays keyboard shortcuts help
 */
export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-md"
        // Apply immediate transition for users who prefer reduced motion
        style={prefersReducedMotion ? { 
          animation: 'none', 
          transition: 'none',
          opacity: 1,
          transform: 'none'
        } : undefined}
      >
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            The following keyboard shortcuts are available for this tool:
          </p>
          <div className="grid gap-2">
            {Object.entries(KEYBOARD_SHORTCUTS).map(([key, shortcut]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{shortcut.description}</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}