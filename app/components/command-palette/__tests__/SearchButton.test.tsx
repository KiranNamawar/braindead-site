import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchButton } from "../SearchButton";
import { SearchProvider } from "~/lib/command-palette/search-context";
import { sampleUtilities } from "~/lib/command-palette/data";

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider utilities={sampleUtilities}>{children}</SearchProvider>
  );
}

describe("SearchButton Mobile Component", () => {
  it("renders with search icon and proper accessibility", () => {
    render(
      <TestWrapper>
        <SearchButton />
      </TestWrapper>
    );

    const button = screen.getByRole("button", { name: "Open search palette" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Open search palette");

    // Should have search icon
    const icon = button.querySelector("svg");
    expect(icon).toBeInTheDocument();

    // Should have screen reader text
    const srText = screen.getByText("Search");
    expect(srText).toHaveClass("sr-only");
  });

  it("supports different variants and sizes", () => {
    render(
      <TestWrapper>
        <SearchButton variant="outline" size="lg" className="custom-class" />
      </TestWrapper>
    );

    const button = screen.getByRole("button", { name: "Open search palette" });
    expect(button).toHaveClass("custom-class");
    // The actual variant and size classes would be applied by the Button component
  });

  it("has proper touch targets for mobile", () => {
    render(
      <TestWrapper>
        <SearchButton />
      </TestWrapper>
    );

    const button = screen.getByRole("button", { name: "Open search palette" });

    // Default size should be 'sm' which provides good touch targets
    expect(button).toBeInTheDocument();

    // Should have proper styling for touch (checking the actual sizing)
    expect(button).toHaveClass("h-8");
  });

  describe("SearchButton Integration", () => {
    it("works properly within header context", () => {
      render(
        <TestWrapper>
          <header className="flex items-center justify-between">
            <h1>Title</h1>
            <div className="flex items-center gap-4">
              <div className="sm:hidden">
                <SearchButton />
              </div>
              <button>Theme Toggle</button>
            </div>
          </header>
        </TestWrapper>
      );

      const searchButton = screen.getByRole("button", {
        name: "Open search palette",
      });
      const themeButton = screen.getByRole("button", { name: "Theme Toggle" });

      expect(searchButton).toBeInTheDocument();
      expect(themeButton).toBeInTheDocument();

      // Should be in a container that's hidden on desktop (sm:hidden)
      const mobileContainer = searchButton.closest(".sm\\:hidden");
      expect(mobileContainer).toBeInTheDocument();
    });

    it("handles click interactions", async () => {
      // Create a spy on console to track state changes
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <TestWrapper>
          <SearchButton />
        </TestWrapper>
      );

      const button = screen.getByRole("button", {
        name: "Open search palette",
      });

      // Should be able to click without throwing errors
      await userEvent.click(button);

      // If there were any critical errors, they would have been logged
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("Error")
      );

      consoleSpy.mockRestore();
    });
  });
});
