import { useState, useEffect, useRef, useCallback } from "react";
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
import { highlightMatches } from "~/lib/command-palette/highlight-matches";
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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const selectedItemRef = useRef<HTMLDivElement>(null);

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
      setSelectedIndex(-1); // Reset selection when closing
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

  // Define category order for consistent display
  const categoryOrder = [
    "Text Tools",
    "Developer Tools",
    "Image Tools",
    "Productivity Tools",
    "Fun Tools",
  ];

  // Group results by category with consistent ordering
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

  // Get ordered categories that have results (hide empty categories)
  const orderedCategories = categoryOrder.filter(
    (category) =>
      groupedResults[category] && groupedResults[category].length > 0
  );

  // Get recent items to show when no query
  const showRecentItems = !query.trim();
  const recentItems = showRecentItems ? recentUtilities.slice(0, 5) : [];
  const recentSearchItems = showRecentItems ? recentSearches.slice(0, 3) : [];

  // Create a flattened list of all selectable items for keyboard navigation
  const getAllSelectableItems = useCallback(() => {
    const items: Array<{
      type: "utility" | "search";
      data: Utility | string;
      id: string;
    }> = [];

    if (showRecentItems) {
      // Add recent utilities
      recentItems.forEach((utility) => {
        items.push({
          type: "utility",
          data: utility,
          id: `recent-utility-${utility.id}`,
        });
      });

      // Add recent searches
      recentSearchItems.forEach((searchQuery, index) => {
        items.push({
          type: "search",
          data: searchQuery,
          id: `recent-search-${index}`,
        });
      });
    } else {
      // Add search results in category order
      orderedCategories.forEach((category) => {
        groupedResults[category].forEach((result) => {
          items.push({
            type: "utility",
            data: result.item,
            id: `result-${result.item.id}`,
          });
        });
      });
    }

    return items;
  }, [
    showRecentItems,
    recentItems,
    recentSearchItems,
    orderedCategories,
    groupedResults,
  ]);

  const selectableItems = getAllSelectableItems();

  // Reset selectedIndex when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, resultsWithScores, recentItems, recentSearchItems]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!paletteOpen) return;

      const items = getAllSelectableItems();
      if (items.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => {
            const next = prev + 1;
            return next >= items.length ? 0 : next;
          });
          break;

        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? items.length - 1 : next;
          });
          break;

        case "Enter":
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            event.preventDefault();
            const selectedItem = items[selectedIndex];

            if (selectedItem.type === "utility") {
              handleSelect(selectedItem.data as Utility);
            } else if (selectedItem.type === "search") {
              setQuery(selectedItem.data as string);
            }
          }
          break;
      }
    },
    [paletteOpen, selectedIndex, getAllSelectableItems, handleSelect, setQuery]
  );

  // Attach keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Auto-scroll to keep selected item visible
  useEffect(() => {
    if (selectedIndex >= 0 && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  // Helper function to check if an item is selected
  const isItemSelected = (itemId: string) => {
    const items = getAllSelectableItems();
    return selectedIndex >= 0 && items[selectedIndex]?.id === itemId;
  };

  // Helper function to get item ref
  const getItemRef = (itemId: string) => {
    return isItemSelected(itemId) ? selectedItemRef : undefined;
  };

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
              {recentItems.map((utility: Utility) => {
                const itemId = `recent-utility-${utility.id}`;
                const isSelected = isItemSelected(itemId);

                return (
                  <CommandItem
                    key={utility.id}
                    value={utility.name}
                    onSelect={() => handleSelect(utility)}
                    ref={getItemRef(itemId)}
                    className={
                      isSelected ? "bg-accent text-accent-foreground" : ""
                    }
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{utility.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {utility.description}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {recentSearchItems.length > 0 && <CommandSeparator />}
          </>
        )}

        {showRecentItems && recentSearchItems.length > 0 && (
          <>
            <CommandGroup heading="Recent Searches">
              {recentSearchItems.map((searchQuery: string, index: number) => {
                const itemId = `recent-search-${index}`;
                const isSelected = isItemSelected(itemId);

                return (
                  <CommandItem
                    key={`search-${index}`}
                    value={searchQuery}
                    onSelect={() => setQuery(searchQuery)}
                    ref={getItemRef(itemId)}
                    className={
                      isSelected ? "bg-accent text-accent-foreground" : ""
                    }
                  >
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">🔍</span>
                      <span>{searchQuery}</span>
                    </div>
                  </CommandItem>
                );
              })}
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
          orderedCategories.map((category, index) => (
            <div key={category}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={category}>
                {groupedResults[category].map((result: SearchResult) => {
                  const itemId = `result-${result.item.id}`;
                  const isSelected = isItemSelected(itemId);

                  return (
                    <CommandItem
                      key={result.item.id}
                      value={result.item.name}
                      onSelect={() => handleSelect(result.item)}
                      ref={getItemRef(itemId)}
                      className={
                        isSelected ? "bg-accent text-accent-foreground" : ""
                      }
                    >
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {highlightMatches(result.item.name, result, {
                              key: "name",
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {result.item.category}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {highlightMatches(result.item.description, result, {
                            key: "description",
                          })}
                        </span>
                        {result.item.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {result.item.tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="text-xs bg-muted px-1 py-0.5 rounded"
                              >
                                {highlightMatches(tag, result, { key: "tags" })}
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
                  );
                })}
              </CommandGroup>
            </div>
          ))}
      </CommandList>
    </CommandDialog>
  );
}
