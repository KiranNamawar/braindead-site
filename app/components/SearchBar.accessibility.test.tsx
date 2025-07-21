import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./SearchBar";

// Mock the remix Link component
jest.mock("@remix-run/react", () => ({
  Link: ({ to, children, className, ...rest }: any) => (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  ),
}));

// Mock search suggestions
const mockSuggestions = [
  { id: "json-formatter", name: "JSON Formatter", description: "Format JSON" },
  { id: "url-encoder", name: "URL Encoder", description: "Encode URLs" },
  {
    id: "base64-encoder",
    name: "Base64 Encoder",
    description: "Encode Base64",
  },
];

describe("SearchBar Accessibility", () => {
  test("has proper ARIA attributes", () => {
    const onSearch = jest.fn();

    render(<SearchBar onSearch={onSearch} suggestions={mockSuggestions} />);

    const input = screen.getByRole("searchbox");
    fireEvent.focus(input);

    // Input should have proper ARIA attributes
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(input).toHaveAttribute("aria-describedby");

    // Suggestions list should be properly labeled
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected");
  });

  test("supports keyboard navigation", () => {
    const onSearch = jest.fn();
    const onSuggestionSelect = jest.fn();

    render(
      <SearchBar
        onSearch={onSearch}
        onSuggestionSelect={onSuggestionSelect}
        suggestions={mockSuggestions}
      />
    );

    const input = screen.getByRole("searchbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "json" } });

    // Arrow down should highlight first suggestion
    fireEvent.keyDown(input, { key: "ArrowDown" });

    const suggestions = screen.getAllByRole("option");
    expect(suggestions[0]).toHaveAttribute("aria-selected", "true");

    // Enter should select the highlighted suggestion
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  test("announces changes to screen readers", () => {
    const onSearch = jest.fn();

    render(<SearchBar onSearch={onSearch} suggestions={mockSuggestions} />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "json" } });

    // Should have aria-live region for announcements
    expect(document.querySelector("[aria-live]")).toBeInTheDocument();
  });

  test("manages focus properly", () => {
    const onSearch = jest.fn();
    const onSuggestionSelect = jest.fn();

    render(
      <SearchBar
        onSearch={onSearch}
        onSuggestionSelect={onSuggestionSelect}
        suggestions={mockSuggestions}
      />
    );

    const input = screen.getByRole("searchbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "json" } });

    // After typing, focus should remain on input
    expect(document.activeElement).toBe(input);

    // Navigate to suggestion
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Focus should still be on input for screen reader compatibility
    expect(document.activeElement).toBe(input);

    // Escape should clear selection and keep focus
    fireEvent.keyDown(input, { key: "Escape" });

    const suggestions = screen.getAllByRole("option");
    expect(suggestions[0]).not.toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(input);
  });

  test("has accessible labels and descriptions", () => {
    const onSearch = jest.fn();

    render(
      <SearchBar
        onSearch={onSearch}
        suggestions={mockSuggestions}
        placeholder="Custom search placeholder"
      />
    );

    const input = screen.getByRole("searchbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "json" } });

    // Suggestions should have accessible names
    const suggestions = screen.getAllByRole("option");
    suggestions.forEach((suggestion) => {
      expect(suggestion).toHaveAccessibleName();
    });

    // Clear button should have accessible label
    const clearButton = screen.getByLabelText(/clear search/i);
    expect(clearButton).toHaveAttribute("aria-label");
  });

  test("works with custom aria-label", () => {
    const onSearch = jest.fn();

    render(<SearchBar onSearch={onSearch} ariaLabel="Custom search label" />);

    expect(screen.getByLabelText("Custom search label")).toBeInTheDocument();
  });
});
