import React from "react";
import { UtilityCard } from "./UtilityCard";
import { getCategoryColorClasses } from "~/lib/categories";
import { cn } from "~/lib/utils";
import type { UtilityDefinition, CategoryType } from "~/lib/types";

export interface CategorySectionProps {
  /**
   * The category name to display
   */
  category: CategoryType;

  /**
   * Array of utilities to display in this category
   */
  utilities: UtilityDefinition[];

  /**
   * Layout variant for the section
   */
  variant?: "grid" | "list" | "compact";

  /**
   * Whether utilities are favorited (by utility ID)
   */
  favorites?: Set<string>;

  /**
   * Callback when favorite status is toggled
   */
  onFavoriteToggle?: (utilityId: string) => void;

  /**
   * Callback when a utility card is clicked
   */
  onUtilityClick?: (utility: UtilityDefinition) => void;

  /**
   * Whether to show the category header
   */
  showHeader?: boolean;

  /**
   * Maximum number of utilities to show (for limiting display)
   */
  maxUtilities?: number;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * CategorySection component for organizing utilities by category
 *
 * Features:
 * - Responsive grid layout with consistent spacing
 * - Category headers with color-coded styling
 * - Utility filtering and responsive behavior
 * - Multiple layout variants (grid, list, compact)
 * - Favorite management integration
 */
export function CategorySection({
  category,
  utilities,
  variant = "grid",
  favorites = new Set(),
  onFavoriteToggle,
  onUtilityClick,
  showHeader = true,
  maxUtilities,
  className,
}: CategorySectionProps) {
  // Get category-specific styling
  const categoryColors = getCategoryColorClasses(category);

  // Limit utilities if specified
  const displayUtilities = maxUtilities
    ? utilities.slice(0, maxUtilities)
    : utilities;

  // If no utilities, don't render anything
  if (displayUtilities.length === 0) {
    return null;
  }

  // Format category name for display
  const categoryDisplayName =
    category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby={`category-${category}-heading`}
    >
      {/* Category Header */}
      {showHeader && (
        <div className="flex items-center gap-3">
          <h2
            id={`category-${category}-heading`}
            className={cn(
              "text-xl font-semibold tracking-tight",
              categoryColors.text
            )}
          >
            {categoryDisplayName}
          </h2>
          <div
            className={cn("h-px flex-1 opacity-20", categoryColors.bg)}
            aria-hidden="true"
          />
          {maxUtilities && utilities.length > maxUtilities && (
            <span className="text-sm text-muted-foreground">
              +{utilities.length - maxUtilities} more
            </span>
          )}
        </div>
      )}

      {/* Utilities Grid/List */}
      <div
        className={cn(
          // Base grid classes
          "gap-4",
          // Variant-specific layout
          variant === "grid" && [
            "grid",
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          ],
          variant === "list" && "space-y-3",
          variant === "compact" && [
            "grid",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
          ]
        )}
        role="list"
        aria-label={`${categoryDisplayName} utilities`}
      >
        {displayUtilities.map((utility) => (
          <div
            key={utility.id}
            role="listitem"
            className={cn(variant === "list" && "w-full")}
          >
            <UtilityCard
              utility={utility}
              variant={variant === "compact" ? "compact" : "default"}
              isFavorite={favorites.has(utility.id)}
              onFavoriteToggle={onFavoriteToggle}
              onClick={onUtilityClick}
              className={cn(variant === "list" && "w-full")}
            />
          </div>
        ))}
      </div>

      {/* Show More Link (if utilities are limited) */}
      {maxUtilities && utilities.length > maxUtilities && (
        <div className="flex justify-center pt-2">
          <button
            className={cn(
              "text-sm font-medium transition-colors",
              categoryColors.text,
              categoryColors.hover,
              "hover:underline focus:outline-none focus:underline"
            )}
            onClick={() => {
              // This could trigger a callback to show all utilities
              // For now, it's just a placeholder
              console.log(`Show all ${utilities.length} ${category} utilities`);
            }}
            aria-label={`Show all ${utilities.length} ${category} utilities`}
          >
            Show all {utilities.length} {categoryDisplayName.toLowerCase()}{" "}
            utilities
          </button>
        </div>
      )}
    </section>
  );
}
