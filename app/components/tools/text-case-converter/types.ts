/**
 * Available case formats
 */
export enum CaseFormat {
  UPPER = "UPPERCASE",
  LOWER = "lowercase",
  TITLE = "Title Case",
  SENTENCE = "Sentence case",
  CAMEL = "camelCase",
  PASCAL = "PascalCase",
  SNAKE = "snake_case",
  KEBAB = "kebab-case",
  CONSTANT = "CONSTANT_CASE",
}

/**
 * Options for text conversion
 */
export interface ConversionOptions {
  /** Whether to preserve acronyms in title and sentence case */
  preserveAcronyms?: boolean;
  /** Custom words to always capitalize (e.g., proper nouns) */
  alwaysCapitalize?: string[];
  /** Custom words to never capitalize (e.g., brand names like "iPhone") */
  neverCapitalize?: string[];
}

/**
 * Information about a case format
 */
export interface CaseFormatInfo {
  id: CaseFormat;
  label: string;
  description: string;
  example: string;
}

/**
 * State for conversion options
 */
export interface ConversionOptionsState {
  preserveAcronyms: boolean;
  alwaysCapitalize: string[];
  neverCapitalize: string[];
}

/**
 * Default conversion options
 */
export const DEFAULT_OPTIONS: ConversionOptionsState = {
  preserveAcronyms: true,
  alwaysCapitalize: [],
  neverCapitalize: [],
};

/**
 * Information about all available case formats
 */
export const CASE_FORMATS: CaseFormatInfo[] = [
  {
    id: CaseFormat.UPPER,
    label: "UPPERCASE",
    description: "All characters in uppercase",
    example: "EXAMPLE TEXT",
  },
  {
    id: CaseFormat.LOWER,
    label: "lowercase",
    description: "All characters in lowercase",
    example: "example text",
  },
  {
    id: CaseFormat.TITLE,
    label: "Title Case",
    description: "First letter of each word capitalized",
    example: "Example Text",
  },
  {
    id: CaseFormat.SENTENCE,
    label: "Sentence case",
    description: "First letter of each sentence capitalized",
    example: "Example text",
  },
  {
    id: CaseFormat.CAMEL,
    label: "camelCase",
    description: "No spaces, first letter lowercase, subsequent words capitalized",
    example: "exampleText",
  },
  {
    id: CaseFormat.PASCAL,
    label: "PascalCase",
    description: "No spaces, all words capitalized",
    example: "ExampleText",
  },
  {
    id: CaseFormat.SNAKE,
    label: "snake_case",
    description: "All lowercase with underscores between words",
    example: "example_text",
  },
  {
    id: CaseFormat.KEBAB,
    label: "kebab-case",
    description: "All lowercase with hyphens between words",
    example: "example-text",
  },
  {
    id: CaseFormat.CONSTANT,
    label: "CONSTANT_CASE",
    description: "All uppercase with underscores between words",
    example: "EXAMPLE_TEXT",
  },
];