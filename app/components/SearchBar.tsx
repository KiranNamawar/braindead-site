import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Clock, Star } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { UtilityDefinition } from "~/lib/types";

interface WorkingSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onEnterSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: Array<{
    type: "suggestion" | "recent" | "favorite";
    text: string;
    utility?: UtilityDefinition;
  }>;
  showSuggestions?: boolean;
  onSuggestionSelect?: (suggestion: string) => void;
  onClearSuggestions?: () => void;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onEnterSearch,
  placeholder = "Search utilities...",
  className,
  suggestions = [],
  showSuggestions = false,
  onSuggestionSelect,
  onClearSuggestions,
}: WorkingSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setSelectedIndex(-1);
        onClearSuggestions?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClearSuggestions]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    onSearch(newValue);
    setSelectedIndex(-1);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) {
        if (e.key === "Enter") {
          onEnterSearch(value);
          setIsFocused(false);
          onClearSuggestions?.();
        } else if (e.key === "Escape") {
          setIsFocused(false);
          onClearSuggestions?.();
          inputRef.current?.blur();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            const selectedSuggestion = suggestions[selectedIndex];
            onSuggestionSelect?.(selectedSuggestion.text);
          } else {
            onEnterSearch(value);
          }
          setIsFocused(false);
          setSelectedIndex(-1);
          onClearSuggestions?.();
          break;
        case "Escape":
          e.preventDefault();
          setIsFocused(false);
          setSelectedIndex(-1);
          onClearSuggestions?.();
          inputRef.current?.blur();
          break;
        case "Tab":
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            e.preventDefault();
            const selectedSuggestion = suggestions[selectedIndex];
            onSuggestionSelect?.(selectedSuggestion.text);
            setIsFocused(false);
            setSelectedIndex(-1);
            onClearSuggestions?.();
          }
          break;
      }
    },
    [
      showSuggestions,
      suggestions,
      selectedIndex,
      value,
      onSuggestionSelect,
      onEnterSearch,
      onClearSuggestions,
    ]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  const handleClear = () => {
    onChange("");
    onSearch("");
    onClearSuggestions?.();
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string, index: number) => {
    onSuggestionSelect?.(suggestion);
    setIsFocused(false);
    setSelectedIndex(-1);
  };

  const getSuggestionIcon = (type: "suggestion" | "recent" | "favorite") => {
    switch (type) {
      case "recent":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "favorite":
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10",
            isFocused && "ring-2 ring-ring ring-offset-2",
            // Hide webkit search styling
            "[&::-webkit-search-cancel-button]:appearance-none",
            "[&::-webkit-search-decoration]:appearance-none"
          )}
          aria-label="Search utilities"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-haspopup="listbox"
          aria-activedescendant={
            selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
          }
          role="combobox"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <ul
            className="max-h-60 overflow-auto py-1"
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  ref={(el) => {
                    suggestionRefs.current[index] = el;
                  }}
                  id={`suggestion-${index}`}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm focus:outline-none",
                    selectedIndex === index
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => handleSuggestionClick(suggestion.text, index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  {getSuggestionIcon(suggestion.type)}
                  <span className="flex-1 truncate">{suggestion.text}</span>
                  {suggestion.utility && (
                    <span className="text-xs text-muted-foreground">
                      {suggestion.utility.category}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
