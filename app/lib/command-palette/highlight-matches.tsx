import React from "react";
import type { SearchResult } from "./search-service";

/**
 * Options for highlighting matched text
 */
interface HighlightOptions {
  /** CSS class name for highlighted text */
  className?: string;

  /** Key to highlight (e.g., "name", "description") */
  key: string;
}

/**
 * Highlights matched text in search results
 * @param text The original text to highlight
 * @param result The search result with match information
 * @param options Highlighting options
 * @returns React element with highlighted text
 */
export function highlightMatches(
  text: string,
  result: SearchResult,
  options: HighlightOptions
): React.ReactNode {
  // If no matches or no match information, return the original text
  if (!result.matches || result.matches.length === 0) {
    return text;
  }

  // Find matches for the specified key
  const matches = result.matches.find((match) => match.key === options.key);
  if (!matches || !matches.indices || matches.indices.length === 0) {
    return text;
  }

  // Sort indices to ensure correct order
  const indices = [...matches.indices].sort((a, b) => a[0] - b[0]);

  // Build highlighted text
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  indices.forEach(([start, end], i) => {
    // Add text before the match
    if (start > lastIndex) {
      parts.push(text.substring(lastIndex, start));
    }

    // Add highlighted match
    parts.push(
      <span
        key={i}
        className={
          options.className || "bg-primary/20 text-primary font-medium"
        }
      >
        {text.substring(start, end + 1)}
      </span>
    );

    lastIndex = end + 1;
  });

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
}
