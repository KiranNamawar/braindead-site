import type { Utility } from "../types";

/**
 * Sample dataset of utilities for development and testing
 * This data represents various tools across different categories
 */
export const sampleUtilities: Utility[] = [
  // Text Tools
  {
    id: "text-case-converter",
    name: "Case Converter",
    description: "Convert text between different cases",
    category: "Text Tools",
    tags: ["text", "case", "uppercase", "lowercase", "title case", "camel case", "snake case"],
    path: "/tools/text/case-converter",
  },
  {
    id: "text-formatter",
    name: "Text Formatter",
    description: "Format and beautify text content",
    category: "Text Tools",
    tags: ["text", "format", "beautify", "indent", "wrap", "trim"],
    path: "/tools/text/formatter",
  },
  {
    id: "markdown-preview",
    name: "Markdown Preview",
    description: "Live preview of markdown with syntax highlighting",
    category: "Text Tools",
    tags: ["markdown", "preview", "editor", "syntax", "formatting"],
    path: "/tools/text/markdown-preview",
  },
  {
    id: "text-diff",
    name: "Text Diff",
    description: "Compare two texts and highlight differences",
    category: "Text Tools",
    tags: ["diff", "compare", "text", "difference", "changes"],
    path: "/tools/text/diff",
  },
  
  // Developer Tools
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format and validate JSON data",
    category: "Developer Tools",
    tags: ["json", "format", "validate", "beautify", "minify"],
    path: "/tools/dev/json-formatter",
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description: "Convert between color formats (HEX, RGB, HSL)",
    category: "Developer Tools",
    tags: ["color", "convert", "hex", "rgb", "hsl", "palette"],
    path: "/tools/dev/color-converter",
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test and debug regular expressions",
    category: "Developer Tools",
    tags: ["regex", "regular expression", "test", "match", "pattern"],
    path: "/tools/dev/regex-tester",
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and verify JWT tokens",
    category: "Developer Tools",
    tags: ["jwt", "token", "decode", "verify", "authentication"],
    path: "/tools/dev/jwt-decoder",
  },
  
  // Image Tools
  {
    id: "image-converter",
    name: "Image Converter",
    description: "Convert images between different formats",
    category: "Image Tools",
    tags: ["image", "convert", "format", "jpg", "png", "webp"],
    path: "/tools/image/converter",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Compress images to reduce file size",
    category: "Image Tools",
    tags: ["image", "compress", "optimize", "size", "quality"],
    path: "/tools/image/compressor",
  },
  
  // Productivity Tools
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert between different units of measurement",
    category: "Productivity Tools",
    tags: ["convert", "units", "measurement", "length", "weight", "temperature"],
    path: "/tools/productivity/unit-converter",
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate secure random passwords",
    category: "Productivity Tools",
    tags: ["password", "generate", "secure", "random", "security"],
    path: "/tools/productivity/password-generator",
  },
  {
    id: "date-calculator",
    name: "Date Calculator",
    description: "Calculate differences between dates",
    category: "Productivity Tools",
    tags: ["date", "time", "calculator", "difference", "duration"],
    path: "/tools/productivity/date-calculator",
  },
  
  // Fun Tools
  {
    id: "meme-generator",
    name: "Meme Generator",
    description: "Create custom memes with your own text",
    category: "Fun Tools",
    tags: ["meme", "generator", "fun", "image", "text"],
    path: "/tools/fun/meme-generator",
  },
  {
    id: "random-picker",
    name: "Random Picker",
    description: "Make random selections from a list of items",
    category: "Fun Tools",
    tags: ["random", "pick", "choose", "decision", "lottery"],
    path: "/tools/fun/random-picker",
  }
];