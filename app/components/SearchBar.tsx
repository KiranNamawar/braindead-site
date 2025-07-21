import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Search, X } from 'lucide-react';
import { SearchSuggestion } from '~/lib/types';
import { cn } from '~/lib/utils';

export interface SearchBarProps {
  /**
   * Callback function for search events
   */
  onSearch: (query: string) => void;
  
  /**
   * Callback function for suggestion selection
   */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;
  
  /**
   * Array of search suggestions
   */
  suggestions?: SearchSuggestion[];
  
  /**
   * Whether the search is currently loading
   */
  isLoading?: boolean;
  
  /**
   * CSS class name for the search bar container
   */
  className?: string;
}

/**
 * SearchBar component with real-time input handling and suggestion dropdown
 */
export function SearchBar({
  onSearch,
  onSuggestionSelect,
  placeholder = 'Search utilities...',
  suggestions = [],
  isLoading = false,
  className
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
    setSelectedIndex(-1);
  };
  
  // Handle clear button click
  const handleClear = () => {
    setQuery('');
    onSearch('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      setQuery(suggestion.text);
      onSearch(suggestion.text);
    }
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          // If at the end, wrap to the beginning
          if (prev >= suggestions.length - 1) {
            return 0;
          }
          // Otherwise, move down
          return prev + 1;
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          // If at the beginning or not selected, wrap to the end
          if (prev <= 0) {
            return suggestions.length - 1;
          }
          // Otherwise, move up
          return prev - 1;
        });
        break;
        
      case 'Tab':
        // Tab should select the current suggestion if one is highlighted
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
        
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          onSearch(query);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsFocused(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
        
      case 'Home':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setSelectedIndex(0);
        }
        break;
        
      case 'End':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setSelectedIndex(suggestions.length - 1);
        }
        break;
        
      default:
        break;
    }
  };
  
  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const suggestionElements = suggestionsRef.current.querySelectorAll('[role="option"]');
      if (suggestionElements[selectedIndex]) {
        suggestionElements[selectedIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex]);
  
  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'utility':
        return '🔧';
      case 'category':
        return '📁';
      case 'keyword':
        return '🏷️';
      default:
        return '🔍';
    }
  };
  
  // Highlight matching text in suggestions
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    try {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">{part}</mark> : part
      );
    } catch (e) {
      return text;
    }
  };
  
  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 text-base"
          aria-label="Search utilities"
          aria-autocomplete="list"
          aria-controls={suggestions.length > 0 ? "search-suggestions" : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          aria-expanded={isFocused && suggestions.length > 0}
          data-testid="search-input"
        />
        
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Suggestions dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="search-suggestions"
          className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border bg-background shadow-lg"
          role="listbox"
        >
          <div className="p-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.text}`}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-sm cursor-pointer",
                  index === selectedIndex
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
                onClick={() => handleSuggestionClick(suggestion)}
                data-testid={`suggestion-${index}`}
              >
                <span className="mr-2" aria-hidden="true">
                  {getSuggestionIcon(suggestion.type)}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {highlightMatch(suggestion.text, query)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}