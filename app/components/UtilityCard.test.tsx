import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UtilityCard } from "./UtilityCard";
import type { UtilityDefinition } from "~/lib/types";

// Mock the react-router Link component
jest.mock("react-router", () => ({
  Link: ({ to, children, className, prefetch, ...rest }: any) => (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  ),
}));

// Mock utility for testing
const mockUtility: UtilityDefinition = {
  id: "json-formatter",
  name: "JSON Formatter",
  description: "Format, validate, and minify JSON with syntax highlighting",
  category: "developer",
  keywords: ["json", "format", "validate", "minify", "pretty", "syntax"],
  route: "/tools/json-formatter",
  icon: "Braces",
  featured: true,
};

describe("UtilityCard", () => {
  test("renders with utility information", () => {
    render(<UtilityCard utility={mockUtility} />);

    expect(screen.getByText("JSON Formatter")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Format, validate, and minify JSON with syntax highlighting"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
  });

  test("renders different variants correctly", () => {
    const { rerender } = render(
      <UtilityCard utility={mockUtility} variant="default" />
    );

    // Default variant should show the description and category badge
    expect(
      screen.getByText(
        "Format, validate, and minify JSON with syntax highlighting"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();

    // Compact variant should still show the description but no footer
    rerender(<UtilityCard utility={mockUtility} variant="compact" />);
    expect(
      screen.getByText(
        "Format, validate, and minify JSON with syntax highlighting"
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Developer")).not.toBeInTheDocument();

    // Featured variant should show everything plus an Open button
    rerender(<UtilityCard utility={mockUtility} variant="featured" />);
    expect(
      screen.getByText(
        "Format, validate, and minify JSON with syntax highlighting"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  test("handles favorite toggling", () => {
    const handleFavoriteToggle = jest.fn();

    render(
      <UtilityCard
        utility={mockUtility}
        isFavorite={false}
        onFavoriteToggle={handleFavoriteToggle}
      />
    );

    // Find and click the favorite button
    const favoriteButton = screen.getByLabelText("Add to favorites");
    fireEvent.click(favoriteButton);

    expect(handleFavoriteToggle).toHaveBeenCalledWith("json-formatter");

    // Test with favorite=true
    const { rerender } = render(
      <UtilityCard
        utility={mockUtility}
        isFavorite={true}
        onFavoriteToggle={handleFavoriteToggle}
      />
    );

    // Should now show "Remove from favorites"
    expect(screen.getByLabelText("Remove from favorites")).toBeInTheDocument();
  });

  test("handles click events", () => {
    const handleClick = jest.fn();

    render(<UtilityCard utility={mockUtility} onClick={handleClick} />);

    // Find and click the card
    const card = screen.getByTestId("utility-card-json-formatter");
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledWith(mockUtility);
  });

  test("renders as a link when no onClick handler is provided", () => {
    render(<UtilityCard utility={mockUtility} />);

    // Should render as a link to the utility route
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tools/json-formatter");
  });

  test("supports keyboard navigation", () => {
    const handleClick = jest.fn();

    render(<UtilityCard utility={mockUtility} onClick={handleClick} />);

    // Find the card
    const card = screen.getByTestId("utility-card-json-formatter");

    // Press Enter key
    fireEvent.keyDown(card, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledWith(mockUtility);

    // Press Space key
    fireEvent.keyDown(card, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  test("has proper accessibility attributes", () => {
    render(<UtilityCard utility={mockUtility} />);

    // Should have proper aria-label
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label", "Open JSON Formatter");
  });
});
