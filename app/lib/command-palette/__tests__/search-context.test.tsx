import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchProvider, useSearch } from "../search-context";

const mockUtilities = [
  {
    id: "1",
    name: "Alpha",
    description: "First",
    category: "A",
    tags: [],
    path: "/alpha",
  },
  {
    id: "2",
    name: "Beta",
    description: "Second",
    category: "B",
    tags: [],
    path: "/beta",
  },
];

function TestComponent() {
  const {
    query,
    setQuery,
    results,
    resultsWithScores,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    recentUtilities,
    addRecentUtility,
  } = useSearch();

  return (
    <div>
      <input
        aria-label="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={() => addRecentSearch(query)} aria-label="add-recent">
        Add Recent
      </button>
      <button onClick={() => clearRecentSearches()} aria-label="clear-recents">
        Clear Recents
      </button>
      <button
        onClick={() => addRecentUtility(mockUtilities[0])}
        aria-label="add-recent-utility"
      >
        Add Recent Utility
      </button>
      <ul aria-label="results">
        {results.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
      <ul aria-label="results-with-scores">
        {resultsWithScores.map((r) => (
          <li key={r.item.id}>
            {r.item.name}:{r.score ?? ""}
          </li>
        ))}
      </ul>
      <ul aria-label="recent-searches">
        {recentSearches.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
      <ul aria-label="recent-utilities">
        {recentUtilities.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}

describe("SearchContext", () => {
  it("should throw if useSearch is used outside provider", () => {
    expect(() => useSearch()).toThrow();
  });

  it("should update query and show results", async () => {
    render(
      <SearchProvider utilities={mockUtilities}>
        <TestComponent />
      </SearchProvider>
    );
    const input = screen.getByLabelText("search-input");
    await act(async () => {
      await userEvent.type(input, "Alpha");
    });
    expect(input).toHaveValue("Alpha");
    // Should show Alpha in results
    expect(screen.getByLabelText("results")).toHaveTextContent("Alpha");
    expect(screen.getByLabelText("results-with-scores")).toHaveTextContent(
      "Alpha"
    );
  });

  it("should add, remove, and clear recent searches", async () => {
    render(
      <SearchProvider utilities={mockUtilities}>
        <TestComponent />
      </SearchProvider>
    );
    const input = screen.getByLabelText("search-input");
    await act(async () => {
      await userEvent.type(input, "Beta");
    });
    await act(async () => {
      await userEvent.click(screen.getByLabelText("add-recent"));
    });
    expect(screen.getByLabelText("recent-searches")).toHaveTextContent("Beta");

    // Clear recents
    await act(async () => {
      await userEvent.click(screen.getByLabelText("clear-recents"));
    });
    expect(screen.getByLabelText("recent-searches")).toBeEmptyDOMElement();
  });

  it("should add recent utility", async () => {
    render(
      <SearchProvider utilities={mockUtilities}>
        <TestComponent />
      </SearchProvider>
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText("add-recent-utility"));
    });
    expect(screen.getByLabelText("recent-utilities")).toHaveTextContent(
      "Alpha"
    );
  });
});
