import React from "react";
import { Link } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Star, StarOff, ExternalLink } from "lucide-react";
import { cn } from "~/lib/utils";
import { getCategoryColorClasses } from "~/lib/categories";
import type { UtilityDefinition } from "~/lib/types";

export interface UtilityCardProps {
  /**
   * The utility to display
   */
  utility: UtilityDefinition;

  /**
   * Visual variant of the card
   */
  variant?: "default" | "compact" | "featured";

  /**
   * Whether the utility is favorited
   */
  isFavorite?: boolean;

  /**
   * Callback when favorite status is toggled
   */
  onFavoriteToggle?: (utilityId: string) => void;

  /**
   * Callback when the card is clicked
   */
  onClick?: (utility: UtilityDefinition) => void;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * UtilityCard component for displaying utility information with category-specific styling
 *
 * Features:
 * - Category-specific color styling
 * - Hover effects and touch-friendly interactions
 * - Accessibility features with proper focus indicators
 * - Multiple display variants (default, compact, featured)
 * - Favorite toggling functionality
 */
export function UtilityCard({
  utility,
  variant = "default",
  isFavorite = false,
  onFavoriteToggle,
  onClick,
  className,
}: UtilityCardProps) {
  // Get category-specific styling
  const categoryColors = getCategoryColorClasses(utility.category);

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(utility);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(utility.id);
    }
  };

  // Determine if card should be interactive
  const isInteractive = !!onClick;

  // Base card classes
  const cardClasses = cn(
    // Base styling
    "relative transition-all duration-200 overflow-hidden",
    // Category-specific border
    "border-l-4",
    categoryColors.border.replace("border-", "border-l-"),
    // Interactive styling
    isInteractive && [
      "cursor-pointer",
      categoryColors.hover,
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    ],
    // Variant-specific styling
    variant === "compact" && "py-3",
    variant === "featured" && [
      "border-l-0 border-t-4",
      categoryColors.border.replace("border-", "border-t-"),
    ],
    className
  );

  // Card content based on variant
  const cardContent = (
    <>
      <CardHeader
        className={cn(
          "pb-2",
          variant === "compact" && "py-2 px-4",
          variant === "featured" && "pb-3"
        )}
      >
        <div className="flex justify-between items-start">
          <div>
            <CardTitle
              className={cn(
                "text-lg font-semibold",
                variant === "compact" && "text-base",
                variant === "featured" && "text-xl"
              )}
            >
              {utility.name}
            </CardTitle>
            <CardDescription
              className={cn(
                "mt-1 line-clamp-2",
                variant === "compact" && "line-clamp-1"
              )}
            >
              {utility.description}
            </CardDescription>
          </div>

          {/* Favorite button */}
          {onFavoriteToggle && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                isFavorite ? "text-yellow-500" : "text-muted-foreground"
              )}
              onClick={handleFavoriteToggle}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              data-testid={`favorite-button-${utility.id}`}
            >
              {isFavorite ? (
                <Star className="h-4 w-4" aria-hidden="true" />
              ) : (
                <StarOff className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {variant !== "compact" && (
        <CardFooter
          className={cn(
            "pt-0 px-6 flex items-center justify-between",
            variant === "featured" && "pt-2"
          )}
        >
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              categoryColors.bg,
              categoryColors.text
            )}
          >
            {utility.category.charAt(0).toUpperCase() +
              utility.category.slice(1)}
          </Badge>

          {variant === "featured" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 h-7"
              asChild
            >
              <Link to={utility.route} prefetch="intent">
                Open <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </CardFooter>
      )}
    </>
  );

  // Render card with or without link wrapper
  return isInteractive ? (
    <Card
      className={cardClasses}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`Open ${utility.name}`}
      data-testid={`utility-card-${utility.id}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {cardContent}
    </Card>
  ) : (
    <Link
      to={utility.route}
      prefetch="intent"
      className="block focus:outline-none"
      aria-label={`Open ${utility.name}`}
    >
      <Card className={cardClasses} data-testid={`utility-card-${utility.id}`}>
        {cardContent}
      </Card>
    </Link>
  );
}
