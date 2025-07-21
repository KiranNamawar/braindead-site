import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  /** Whether the command palette is open */
  isOpen: boolean;
  /** Function to toggle the command palette */
  onToggle: (open: boolean) => void;
}

/**
 * Custom hook to handle keyboard shortcuts for the command palette
 * Handles Cmd+K/Ctrl+K and "/" shortcuts to open, and Escape to close
 */
export function useKeyboardShortcuts({
  isOpen,
  onToggle,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when user is typing in an input, textarea, or contenteditable
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        // Allow escape even in inputs to close the palette
        if (event.key === "Escape" && isOpen) {
          event.preventDefault();
          onToggle(false);
        }
        return;
      }

      // Cmd+K / Ctrl+K shortcut
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onToggle(!isOpen);
        return;
      }

      // "/" shortcut - only when palette is closed
      if (event.key === "/" && !isOpen) {
        event.preventDefault();
        onToggle(true);
        return;
      }

      // Escape shortcut - only when palette is open
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        onToggle(false);
        return;
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onToggle]);
}
