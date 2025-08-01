import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { XIcon } from "lucide-react";
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
import "./command-palette.css";

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
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const [announceText, setAnnounceText] = useState<string>("");

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

  // Toggle category collapse state
  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
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

  // Live region announcements for screen readers
  useEffect(() => {
    if (!paletteOpen) return;

    let announcement = "";
    const totalResults = resultsWithScores.length;

    if (query.trim()) {
      if (totalResults === 0) {
        announcement = "No tools found";
      } else if (totalResults === 1) {
        announcement = "1 tool found";
      } else {
        announcement = `${totalResults} tools found`;
      }
    } else if (recentItems.length > 0 || recentSearchItems.length > 0) {
      announcement = "Recent tools and searches loaded";
    } else {
      announcement = "Command palette opened";
    }

    // Debounce announcements to avoid overwhelming screen readers
    const timeoutId = setTimeout(() => {
      setAnnounceText(announcement);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [
    paletteOpen,
    query,
    resultsWithScores.length,
    recentItems.length,
    recentSearchItems.length,
  ]);

  // Create a flattened list of all selectable items for keyboard navigation
  const getAllSelectableItems = useCallback(() => {
    const items: Array<{
      type: "utility" | "search" | "category";
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
      // Add search results in category order with category headers
      orderedCategories.forEach((category) => {
        // Add category header as selectable item
        items.push({
          type: "category",
          data: category,
          id: `category-${category}`,
        });

        // Add category items only if category is not collapsed
        if (!collapsedCategories.has(category)) {
          groupedResults[category].forEach((result) => {
            items.push({
              type: "utility",
              data: result.item,
              id: `result-${result.item.id}`,
            });
          });
        }
      });
    }

    return items;
  }, [
    showRecentItems,
    recentItems,
    recentSearchItems,
    orderedCategories,
    groupedResults,
    collapsedCategories,
  ]);

  const selectableItems = getAllSelectableItems();

  // Reset selectedIndex when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, resultsWithScores, recentItems, recentSearchItems]);

  // Handle keyboard navigation for wrap-around and category toggling
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!paletteOpen) return;

      // Only handle specific keys that we need for wrap-around or category toggling
      if (event.key === "Enter" || event.key === " ") {
        const items = getAllSelectableItems();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          const selectedItem = items[selectedIndex];

          if (selectedItem.type === "category") {
            event.preventDefault();
            event.stopPropagation();
            toggleCategory(selectedItem.data as string);
          }
        }
      }
    },
    [paletteOpen, selectedIndex, getAllSelectableItems, toggleCategory]
  );

  // Attach keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true); // Use capture phase
    return () => document.removeEventListener("keydown", handleKeyDown, true);
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
      loop={true}
    >
      {/* Screen reader live region for announcements */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {announceText}
      </div>

      <div className="relative">
        <CommandInput
          ref={inputRef}
          placeholder="Search for tools and utilities..."
          value={query}
          onValueChange={setQuery}
          aria-label="Search for tools and utilities"
          aria-describedby="search-help"
        />
        {/* Mobile close button */}
        <button
          onClick={() => handleOpenChange(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-accent hover:text-accent-foreground sm:hidden"
          aria-label="Close search"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Hidden search help text */}
      <div id="search-help" className="sr-only">
        Use arrow keys to navigate results, Enter to select, Escape to close
      </div>
      <CommandList role="listbox" aria-label="Search results">
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
          orderedCategories.map((category, index) => {
            const isCollapsed = collapsedCategories.has(category);
            const categoryId = `category-${category}`;
            const isCategorySelected = isItemSelected(categoryId);

            return (
              <div key={category}>
                {index > 0 && <CommandSeparator />}

                {/* Custom collapsible category header */}
                <div
                  className={`flex items-center justify-between px-2 text-sm font-medium text-muted-foreground cursor-pointer hover:bg-accent hover:text-accent-foreground command-category-header ${
                    isCategorySelected ? "bg-accent text-accent-foreground" : ""
                  }
                  py-3 sm:py-1 min-h-[44px] sm:min-h-[auto] active:bg-accent/80`}
                  onClick={() => toggleCategory(category)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCategory(category);
                    }
                  }}
                  ref={getItemRef(categoryId)}
                  data-testid={`category-header-${category
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  tabIndex={0}
                  role="button"
                  aria-expanded={!isCollapsed}
                  aria-label={`${
                    isCollapsed ? "Expand" : "Collapse"
                  } ${category} category`}
                >
                  <span>{category}</span>
                  <span className="text-sm sm:text-xs">
                    {isCollapsed ? "▶" : "▼"}
                  </span>
                </div>

                {/* Category items - only show if not collapsed */}
                {!isCollapsed && (
                  <CommandGroup>
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
                              {highlightMatches(
                                result.item.description,
                                result,
                                {
                                  key: "description",
                                }
                              )}
                            </span>
                            {result.item.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {result.item.tags
                                  .slice(0, 3)
                                  .map((tag: string) => (
                                    <span
                                      key={tag}
                                      className="text-xs bg-muted px-1 py-0.5 rounded"
                                    >
                                      {highlightMatches(tag, result, {
                                        key: "tags",
                                      })}
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
                )}
              </div>
            );
          })}
      </CommandList>
    </CommandDialog>
  );
}
