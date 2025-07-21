import { describe, it, expect } from "vitest";
import { SearchService } from "../search-service";
import type { Utility } from "../../types";

// Mock utilities for testing
const mockUtilities: Utility[] = [
  {
    id: "test-tool-1",
    name: "Test Tool One",
    description: "This is the first test tool",
    category: "Test Category",
    tags: ["test", "one", "first"],
    path: "/test/one",
  },
  {
    id: "test-tool-2",
    name: "Test Tool Two",
    description: "This is the second test tool",
    category: "Test Category",
    tags: ["test", "two", "second"],
    path: "/test/two",
  },
  {
    id: "another-tool",
    name: "Another Tool",
    description: "This is another test tool",
    category: "Another Category",
    tags: ["another", "test"],
    path: "/another",
  },
];

describe("SearchService", () => {
  it("should return empty results for empty query", () => {
    const searchService = new SearchService(mockUtilities);
    const results = searchService.search("");
    expect(results).toEqual([]);
  });

  it("should return empty results for short query", () => {
    const searchService = new SearchService(mockUtilities);
    const results = searchService.search("a");
    expect(results).toEqual([]);
  });

  it("should find exact matches", () => {
    const searchService = new SearchService(mockUtilities);
    const results = searchService.search("Test Tool One");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => result.id === "test-tool-1")).toBe(true);
  });

  it("should find partial matches", () => {
    const searchService = new SearchService(mockUtilities);
    const results = searchService.search("test");
    expect(results.length).toBe(3);
  });

  it("should find matches in different fields", () => {
    const searchService = new SearchService(mockUtilities);

    // Match in name
    const nameResults = searchService.search("Another");
    expect(nameResults.length).toBe(1);
    expect(nameResults[0].id).toBe("another-tool");

    // Match in description
    const descResults = searchService.search("first");
    expect(descResults.length).toBe(1);
    expect(descResults[0].id).toBe("test-tool-1");

    // Match in tags
    const tagResults = searchService.search("second");
    expect(tagResults.length).toBe(1);
    expect(tagResults[0].id).toBe("test-tool-2");
  });

  it("should return results with scores", () => {
    const searchService = new SearchService(mockUtilities);
    const results = searchService.searchWithScores("test");

    expect(results.length).toBe(3);
    expect(results[0].score).toBeDefined();
    expect(results[0].item).toBeDefined();
  });

  it("should update utilities", () => {
    const searchService = new SearchService(mockUtilities);

    // Initial search
    const initialResults = searchService.search("new");
    expect(initialResults.length).toBe(0);

    // Update utilities
    const newUtilities = [
      ...mockUtilities,
      {
        id: "new-tool",
        name: "New Tool",
        description: "This is a new tool",
        category: "New Category",
        tags: ["new", "tool"],
        path: "/new",
      },
    ];

    searchService.updateUtilities(newUtilities);

    // Search again
    const updatedResults = searchService.search("new");
    expect(updatedResults.length).toBe(1);
    expect(updatedResults[0].id).toBe("new-tool");
  });

  it("should throw error when trying to update search options", () => {
    const searchService = new SearchService(mockUtilities);

    // Trying to update options should throw an error
    expect(() => {
      searchService.updateOptions({
        minMatchCharLength: 1,
      });
    }).toThrow(
      "updateOptions requires storing original utilities. Use updateUtilities instead."
    );
  });
});
