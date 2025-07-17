// Advanced fuzzy search implementation for tool discovery
import { Tool } from '../types';

interface SearchMatch {
  tool: Tool;
  score: number;
  matchedFields: string[];
  highlightRanges: Array<{ field: string; ranges: Array<[number, number]> }>;
}

interface SearchOptions {
  threshold: number;
  includeScore: boolean;
  includeMatches: boolean;
  minMatchCharLength: number;
  shouldSort: boolean;
  findAllMatches: boolean;
  keys: Array<{
    name: string;
    weight: number;
  }>;
}

class FuzzySearch {
  private options: SearchOptions;

  constructor(options: Partial<SearchOptions> = {}) {
    this.options = {
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
      findAllMatches: true,
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'keywords', weight: 0.2 },
        { name: 'features', weight: 0.1 }
      ],
      ...options
    };
  }

  public search(query: string, tools: Tool[]): SearchMatch[] {
    if (!query.trim()) return [];

    const results: SearchMatch[] = [];
    const normalizedQuery = query.toLowerCase().trim();

    for (const tool of tools) {
      const match = this.matchTool(normalizedQuery, tool);
      if (match.score > this.options.threshold) {
        results.push(match);
      }
    }

    if (this.options.shouldSort) {
      results.sort((a, b) => b.score - a.score);
    }

    return results;
  }

  private matchTool(query: string, tool: Tool): SearchMatch {
    let totalScore = 0;
    let totalWeight = 0;
    const matchedFields: string[] = [];
    const highlightRanges: Array<{ field: string; ranges: Array<[number, number]> }> = [];

    for (const key of this.options.keys) {
      const fieldValue = this.getFieldValue(tool, key.name);
      if (!fieldValue) continue;

      const fieldMatch = this.matchField(query, fieldValue, key.name);
      if (fieldMatch.score > 0) {
        totalScore += fieldMatch.score * key.weight;
        totalWeight += key.weight;
        matchedFields.push(key.name);
        
        if (fieldMatch.ranges.length > 0) {
          highlightRanges.push({
            field: key.name,
            ranges: fieldMatch.ranges
          });
        }
      }
    }

    // Normalize score
    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    // Bonus for exact matches
    const exactBonus = this.calculateExactBonus(query, tool);
    const adjustedScore = Math.min(1, finalScore + exactBonus);

    return {
      tool,
      score: adjustedScore,
      matchedFields,
      highlightRanges
    };
  }

  private getFieldValue(tool: Tool, fieldName: string): string | string[] | null {
    switch (fieldName) {
      case 'name':
        return tool.name;
      case 'description':
        return tool.description;
      case 'keywords':
        return tool.keywords;
      case 'features':
        return tool.features;
      case 'shortcuts':
        return tool.shortcuts;
      case 'sarcasticQuote':
        return tool.sarcasticQuote;
      default:
        return null;
    }
  }

  private matchField(query: string, fieldValue: string | string[], fieldName: string): {
    score: number;
    ranges: Array<[number, number]>;
  } {
    if (Array.isArray(fieldValue)) {
      return this.matchArrayField(query, fieldValue);
    } else {
      return this.matchStringField(query, fieldValue);
    }
  }

  private matchStringField(query: string, text: string): {
    score: number;
    ranges: Array<[number, number]>;
  } {
    const normalizedText = text.toLowerCase();
    const ranges: Array<[number, number]> = [];
    
    // Exact match gets highest score
    if (normalizedText.includes(query)) {
      const index = normalizedText.indexOf(query);
      ranges.push([index, index + query.length]);
      return { score: 1.0, ranges };
    }

    // Word boundary match
    const words = normalizedText.split(/\s+/);
    let wordScore = 0;
    for (const word of words) {
      if (word.startsWith(query)) {
        wordScore = Math.max(wordScore, 0.8);
      } else if (word.includes(query)) {
        wordScore = Math.max(wordScore, 0.6);
      }
    }

    if (wordScore > 0) {
      return { score: wordScore, ranges };
    }

    // Character-by-character fuzzy matching
    const fuzzyScore = this.calculateFuzzyScore(query, normalizedText);
    return { score: fuzzyScore, ranges };
  }

  private matchArrayField(query: string, items: string[]): {
    score: number;
    ranges: Array<[number, number]>;
  } {
    let bestScore = 0;
    const ranges: Array<[number, number]> = [];

    for (const item of items) {
      const itemMatch = this.matchStringField(query, item);
      if (itemMatch.score > bestScore) {
        bestScore = itemMatch.score;
      }
    }

    return { score: bestScore, ranges };
  }

  private calculateFuzzyScore(query: string, text: string): number {
    if (query.length === 0) return 1;
    if (text.length === 0) return 0;

    const queryLen = query.length;
    const textLen = text.length;
    
    // Create a matrix for dynamic programming
    const matrix: number[][] = [];
    for (let i = 0; i <= queryLen; i++) {
      matrix[i] = [];
      for (let j = 0; j <= textLen; j++) {
        matrix[i][j] = 0;
      }
    }

    // Initialize first row and column
    for (let i = 0; i <= queryLen; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= textLen; j++) {
      matrix[0][j] = j;
    }

    // Fill the matrix
    for (let i = 1; i <= queryLen; i++) {
      for (let j = 1; j <= textLen; j++) {
        const cost = query[i - 1] === text[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[queryLen][textLen];
    const maxLen = Math.max(queryLen, textLen);
    
    // Convert distance to similarity score (0-1)
    return Math.max(0, 1 - distance / maxLen);
  }

  private calculateExactBonus(query: string, tool: Tool): number {
    const normalizedQuery = query.toLowerCase();
    let bonus = 0;

    // Exact name match
    if (tool.name.toLowerCase() === normalizedQuery) {
      bonus += 0.3;
    }

    // Shortcut match
    if (tool.shortcuts.some(shortcut => shortcut.toLowerCase() === normalizedQuery)) {
      bonus += 0.2;
    }

    // Keyword exact match
    if (tool.keywords.some(keyword => keyword.toLowerCase() === normalizedQuery)) {
      bonus += 0.1;
    }

    return bonus;
  }

  public highlightMatches(text: string, query: string): string {
    if (!query.trim()) return text;

    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    const index = normalizedText.indexOf(normalizedQuery);
    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);

    return `${before}<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">${match}</mark>${after}`;
  }
}

// Tool shortcuts mapping for quick access
export const TOOL_SHORTCUTS: Record<string, string[]> = {
  'calculator': ['calc', 'math', 'calculate', 'arithmetic'],
  'color-picker': ['color', 'hex', 'rgb', 'hsl', 'palette'],
  'qr-generator': ['qr', 'code', 'qrcode', 'generator'],
  'text-tools': ['text', 'case', 'convert', 'transform'],
  'password-generator': ['pass', 'password', 'pwd', 'secure'],
  'hash-generator': ['hash', 'md5', 'sha', 'checksum', 'crypto'],
  'image-optimizer': ['img', 'image', 'compress', 'optimize'],
  'timestamp-converter': ['time', 'timestamp', 'unix', 'date'],
  'json-formatter': ['json', 'format', 'pretty', 'validate'],
  'random-generator': ['random', 'uuid', 'generate', 'rand'],
  'unit-converter': ['unit', 'convert', 'metric', 'imperial']
};

// Enhanced search function that includes shortcuts
export function searchToolsWithShortcuts(query: string, tools: Tool[]): Tool[] {
  const fuzzySearch = new FuzzySearch();
  const normalizedQuery = query.toLowerCase().trim();

  // First, check for exact shortcut matches
  for (const [toolId, shortcuts] of Object.entries(TOOL_SHORTCUTS)) {
    if (shortcuts.includes(normalizedQuery)) {
      const tool = tools.find(t => t.id === toolId);
      if (tool) {
        return [tool]; // Return immediately for exact shortcut match
      }
    }
  }

  // If no exact shortcut match, perform fuzzy search
  const results = fuzzySearch.search(query, tools);
  return results.map(result => result.tool);
}

// Create singleton instance
export const fuzzySearch = new FuzzySearch();

// Export convenience functions
export const searchTools = (query: string, tools: Tool[]) => searchToolsWithShortcuts(query, tools);
export const highlightMatches = (text: string, query: string) => fuzzySearch.highlightMatches(text, query);