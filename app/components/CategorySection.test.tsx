import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategorySection } from "./CategorySection";
import type { UtilityDefinition } from "~/lib/types";

// Mock the remix Link component
jest.mock("@remix-run/react", () => ({
  Link: ({ to, children, className, prefetch, ...rest }: any) => (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  ),
}));

// Mock utilities for testing
const mockUtilities: UtilityDefinition[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON with syntax highlighting",
    category: "developer",
    keywords: ["json", "format", "validate", "minify", "pretty", "syntax"],
    route: "/tools/json-formatter",
    icon: "Braces",
    featured: true,
  },
  {
    id: "url-encoder",
    name: "URL Encoder/Decoder",
    description: "Encode and decode URLs for safe transmission",
    category: "developer",
    keywords: ["url", "encode", "decode", "uri", "percent", "escape"],
    route: "/tools/url-encoder",
    icon: "Link",
    featured: false,
  },
  {
    id: "base64-encoder",
    name: "Base64 Encoder",
    description: "Encode and decode Base64 strings",
    category: "developer",
    keywords: ["base64", "encode", "decode", "binary", "text"],
    route: "/tools/base64-encoder",
    icon: "Binary",
    featured: false,
  },
];

describe("CategorySection", () => {
  test("renders with category header and utilities", () => {
    render(<CategorySection category="developer" utilities={mockUtilities} />);

    // Category header should be displayed
    expect(screen.getByText("Developer")).toBeInTheDocument();

    // All utilities should be rendered
    expect(screen.getByText("JSON Formatter")).toBeInTheDocument();
    expect(screen.getByText("URL Encoder/Decoder")).toBeInTheDocument();
    expect(screen.getByText("Base64 Encoder")).toBeInTheDocument();
  });

  test("hides header when showHeader is false", () => {
    render(
      <CategorySection
        category="developer"
        utilities={mockUtilities}
        showHeader={false}
      />
    );

    // Category header should not be displayed
    expect(screen.queryByText("Developer")).not.toBeInTheDocument();

    // Utilities should still be rendered
    expect(screen.getByText("JSON Formatter")).toBeInTheDocument();
  });

  test("renders different layout variants", () => {
    // Test grid variant (default)
    const { rerender } = render(
      <CategorySection
        category="developer"
        utilities={mockUtilities}
        variant="grid"
      />
    );

    let container = screen.getByRole("list");
    expect(container.className).toContain("grid");

    // Test list variant
    rerender(
      <CategorySection
        category="developer"
        utilities={mockUtilities}
        variant="list"
      />
    );

    container = screen.getByRole("list");
    expect(container.className).toContain("space-y-3");

    // Test compact variant
    rerender(
      <CategorySection
        category="developer"
        utilities={mockUtilities}
        variant="compact"
      />
    );

    container = screen.getByRole("list");
    expect(container.className).toContain("grid");
    expect(container.className).toContain("gap-3");
  });

  test("limits utilities when maxUtilities is specified", () => {
    render(
      <CategorySection
        category="developer"
        utilities={mockUtilities}
        maxUtilities={2}
      />
    );

    // Should show only 2 utilities
    expect(screen.getByText("JSON Formatter")).toBeInTheDocument();
    expect(screen.getByText("URL Encoder/Decoder")).toBeInTheDocument();
    expect(screen.queryByText("Base64 Encoder")).not.toBeInTheDocument();

    // Should show "+1 more" indicator
    expect(screen.getByText("+1 more")).toBeInTheDocument();

    // Should show "Show all" button
    expect(
      screen.getByText("Show all 3 developer utilities")
    ).toBeInTheDocument();
  });

  test("handles favorite toggling", () => {
    const handleFavoriteToggle = jest.fn();
    const favorites = new Set(["json-formatter"]);

    render(
      <CategorySection
        category="developer"
        utilities={mockUtilities}
        favorites={favorites}
        onFavoriteToggle={handleFavoriteToggle}
      />
    );

    // Find and click a favorite button
    const favoriteButtons = screen.getAllByLabelText(/favorites/);
    fireEvent.click(favoriteButtons[0]);

    expect(handleFavoriteToggle).toHaveBeenCalled();
  });

  test("handles utility click events", () => {
    const handleUtilityClick = jest.fn();

    render(
      <CategorySection
        category="developer"
        utilities={mockUtilities}
        onUtilityClick={handleUtilityClick}
      />
    );

    // Find and click a utility card
    const card = screen.getByTestId("utility-card-json-formatter");
    fireEvent.click(card);

    expect(handleUtilityClick).toHaveBeenCalledWith(mockUtilities[0]);
  });

  test("returns null when no utilities provided", () => {
    const { container } = render(
      <CategorySection category="developer" utilities={[]} />
    );

    expect(container.firstChild).toBeNull();
  });

  test("has proper accessibility attributes", () => {
    render(<CategorySection category="developer" utilities={mockUtilities} />);

    // Section should have proper labelling
    const section = screen.getByRole("region", {
      name: /developer utilities/i,
    });
    expect(section).toBeInTheDocument();

    // Header should have proper ID
    const heading = screen.getByRole("heading", { name: "Developer" });
    expect(heading).toHaveAttribute("id", "category-developer-heading");

    // List should have proper label
    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-label", "Developer utilities");
  });

  test("formats category names correctly", () => {
    render(<CategorySection category="text" utilities={[mockUtilities[0]]} />);

    // Should capitalize category name
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  test("applies custom className", () => {
    const { container } = render(
      <CategorySection
        category="developer"
        utilities={mockUtilities}
        className="custom-class"
      />
    );

    const section = container.firstChild as HTMLElement;
    expect(section.className).toContain("custom-class");
  });
});
