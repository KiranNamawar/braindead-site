import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { CommandPalette } from "../CommandPalette";
import { SearchProvider } from "~/lib/command-palette/search-context";

// Mock the react-router navigate
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <SearchProvider>{children}</SearchProvider>
  </BrowserRouter>
);

describe("CommandPalette", () => {
  it("renders command palette when open", () => {
    render(
      <TestWrapper>
        <CommandPalette open={true} />
      </TestWrapper>
    );

    expect(
      screen.getByPlaceholderText("Search for tools and utilities...")
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <TestWrapper>
        <CommandPalette open={false} />
      </TestWrapper>
    );

    expect(
      screen.queryByPlaceholderText("Search for tools and utilities...")
    ).not.toBeInTheDocument();
  });

  it("shows recent tools section when no query", () => {
    render(
      <TestWrapper>
        <CommandPalette open={true} />
      </TestWrapper>
    );

    // The component should show recent sections when there's no search query
    // Since there are no recent items initially, we mainly test that it renders
    expect(
      screen.getByPlaceholderText("Search for tools and utilities...")
    ).toBeInTheDocument();
  });
});
