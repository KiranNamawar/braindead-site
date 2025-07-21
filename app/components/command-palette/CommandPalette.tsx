import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "~/components/ui/command";
import { useSearch } from "~/lib/command-palette/search-context";
import { useKeyboardShortcuts } from "./KeyboardShortcuts";
import type { Utility } from "~/lib/types";
import type { SearchResult } from "~/lib/command-palette/search-service";

interface CommandPaletteProps {
  /** Whether the command palette is open */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    setQuery,
    results,
    resultsWithScores,
    isOpen,
    setIsOpen,
    recentSearches,
    recentUtilities,
    addRecentSearch,
    addRecentUtility,
  } = useSearch();

  // Use props if provided, otherwise use context
  const paletteOpen = open !== undefined ? open : isOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    isOpen: paletteOpen,
    onToggle: handleOpenChange,
  });

  // Clear query when palette closes
  useEffect(() => {
    if (!paletteOpen) {
      setQuery("");
    }
  }, [paletteOpen, setQuery]);

  // Focus management - focus the input when palette opens
  useEffect(() => {
    if (paletteOpen && inputRef.current) {
      // Small delay to ensure the dialog is fully rendered
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [paletteOpen]);

  // Handle utility selection
  const handleSelect = (utility: Utility) => {
    // Add to recent utilities
    addRecentUtility(utility);

    // Add search query to recent searches if there was a query
    if (query.trim()) {
      addRecentSearch(query.trim());
    }

    // Navigate to the utility
    navigate(utility.path);

    // Close the palette
    handleOpenChange(false);
  };

  // Group results by category
  const groupedResults = resultsWithScores.reduce(
    (groups: Record<string, SearchResult[]>, result: SearchResult) => {
      const category = result.item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(result);
      return groups;
    },
    {} as Record<string, SearchResult[]>
  );

  // Get recent items to show when no query
  const showRecentItems = !query.trim();
  const recentItems = showRecentItems ? recentUtilities.slice(0, 5) : [];
  const recentSearchItems = showRecentItems ? recentSearches.slice(0, 3) : [];

  return (
    <CommandDialog
      open={paletteOpen}
      onOpenChange={handleOpenChange}
      title="Command Palette"
      description="Search for tools and utilities"
    >
      <CommandInput
        ref={inputRef}
        placeholder="Search for tools and utilities..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {showRecentItems && recentItems.length > 0 && (
          <>
            <CommandGroup heading="Recent Tools">
              {recentItems.map((utility: Utility) => (
                <CommandItem
                  key={utility.id}
                  value={utility.name}
                  onSelect={() => handleSelect(utility)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{utility.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {utility.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {recentSearchItems.length > 0 && <CommandSeparator />}
          </>
        )}

        {showRecentItems && recentSearchItems.length > 0 && (
          <>
            <CommandGroup heading="Recent Searches">
              {recentSearchItems.map((searchQuery: string, index: number) => (
                <CommandItem
                  key={`search-${index}`}
                  value={searchQuery}
                  onSelect={() => setQuery(searchQuery)}
                >
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">🔍</span>
                    <span>{searchQuery}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!showRecentItems && Object.keys(groupedResults).length === 0 && (
          <CommandEmpty>
            <div className="flex flex-col items-center py-6">
              <span className="text-2xl mb-2">🔍</span>
              <span className="font-medium">No tools found</span>
              <span className="text-sm text-muted-foreground">
                Try searching for something else
              </span>
            </div>
          </CommandEmpty>
        )}

        {!showRecentItems &&
          Object.keys(groupedResults).map((category, index) => (
            <div key={category}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={category}>
                {groupedResults[category].map((result: SearchResult) => (
                  <CommandItem
                    key={result.item.id}
                    value={result.item.name}
                    onSelect={() => handleSelect(result.item)}
                  >
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {result.item.category}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {result.item.description}
                      </span>
                      {result.item.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {result.item.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs bg-muted px-1 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {result.item.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{result.item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
      </CommandList>
    </CommandDialog>
  );
}
