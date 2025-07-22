import { CaseFormat, ConversionOptions } from "./types";

/**
 * Convert text to uppercase
 * 
 * @param text The input text to convert
 * @returns The text in uppercase
 */
export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

/**
 * Convert text to lowercase
 * 
 * @param text The input text to convert
 * @returns The text in lowercase
 */
export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

/**
 * Convert text to title case
 * 
 * @param text The input text to convert
 * @param options Additional conversion options
 * @returns The text in title case
 */
export function toTitleCase(text: string, options: ConversionOptions = {}): string {
  if (!text) return text;
  
  // Words that should not be capitalized in title case (unless they are the first or last word)
  const minorWords = new Set([
    'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'as', 'at', 
    'by', 'for', 'from', 'in', 'into', 'near', 'of', 'on', 'onto', 
    'to', 'with'
  ]);
  
  // Split the text into words and spaces
  const parts = [];
  let currentWord = '';
  let currentSpace = '';
  let inWord = true;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (/\s/.test(char)) {
      // This is a space
      if (inWord) {
        // Transition from word to space
        if (currentWord) {
          parts.push(currentWord);
          currentWord = '';
        }
        inWord = false;
      }
      currentSpace += char;
    } else {
      // This is a word character
      if (!inWord) {
        // Transition from space to word
        if (currentSpace) {
          parts.push(currentSpace);
          currentSpace = '';
        }
        inWord = true;
      }
      currentWord += char;
    }
  }
  
  // Add the last word or space
  if (currentWord) {
    parts.push(currentWord);
  } else if (currentSpace) {
    parts.push(currentSpace);
  }
  
  const result: string[] = [];
  
  // Track actual words (not spaces) for determining first/last word
  const words = parts.filter(part => /\S/.test(part));
  
  let wordIndex = 0;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // If this is a space, add it as is
    if (/^\s+$/.test(part)) {
      result.push(part);
      continue;
    }
    
    // Skip empty parts
    if (!part) {
      result.push(part);
      continue;
    }
    
    // This is a word
    const isFirstWord = wordIndex === 0;
    const isLastWord = wordIndex === words.length - 1;
    wordIndex++;
    
    // Check if the word is an acronym and should be preserved
    if (options.preserveAcronyms !== false && isAcronym(part)) {
      result.push(part);
      continue;
    }
    
    // Check if the word should be capitalized
    const lowerWord = part.toLowerCase();
    
    // Always capitalize words in the alwaysCapitalize list
    if (options.alwaysCapitalize?.some(w => w.toLowerCase() === lowerWord)) {
      // Use the case from alwaysCapitalize
      const matchedWord = options.alwaysCapitalize.find(w => w.toLowerCase() === lowerWord);
      result.push(matchedWord || capitalizeWord(part, options));
      continue;
    }
    
    // Never capitalize words in the neverCapitalize list
    if (options.neverCapitalize?.some(w => w.toLowerCase() === lowerWord)) {
      // Use the case from neverCapitalize or lowercase
      const matchedWord = options.neverCapitalize.find(w => w.toLowerCase() === lowerWord);
      result.push(matchedWord || lowerWord);
      continue;
    }
    
    // Always capitalize the first and last word
    if (isFirstWord || isLastWord) {
      result.push(capitalizeWord(part, { ...options, preserveAcronyms: false }));
      continue;
    }
    
    // Check if the word is a minor word
    if (minorWords.has(lowerWord)) {
      result.push(lowerWord);
      continue;
    }
    
    // For all other words, capitalize them
    result.push(capitalizeWord(part, { ...options, preserveAcronyms: false }));
  }
  
  return result.join('');
}

/**
 * Convert text to sentence case
 * 
 * @param text The input text to convert
 * @param options Additional conversion options
 * @returns The text in sentence case
 */
export function toSentenceCase(text: string, options: ConversionOptions = {}): string {
  if (!text) return text;
  
  // Convert the entire text to lowercase first
  const lowerText = text.toLowerCase();
  
  // Split the text into sentences
  // This regex matches sentence boundaries: period, question mark, or exclamation mark
  // followed by a space or end of string
  const sentences = lowerText.split(/([.!?][\s$])/);
  
  let result = '';
  let capitalizeNext = true;
  
  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    
    if (!part) {
      continue;
    }
    
    // If this part is a sentence boundary, add it as is and set flag to capitalize next part
    if (/^[.!?][\s$]/.test(part)) {
      result += part;
      capitalizeNext = true;
      continue;
    }
    
    // Process the words in this sentence
    const words = part.split(/(\s+)/);
    let processedPart = '';
    
    for (let j = 0; j < words.length; j++) {
      const word = words[j];
      
      // If this is a space, add it as is
      if (/^\s+$/.test(word)) {
        processedPart += word;
        continue;
      }
      
      // Get the original word from the input text to check if it's an acronym
      const originalWord = text.substring(result.length + processedPart.length, 
                                         result.length + processedPart.length + word.length);
      
      // Check if the original word is an acronym and should be preserved
      if (options.preserveAcronyms !== false && isAcronym(originalWord)) {
        processedPart += originalWord;
        continue;
      }
      
      // Check if the word should be capitalized
      const lowerWord = word.toLowerCase();
      
      // Always capitalize words in the alwaysCapitalize list
      if (options.alwaysCapitalize?.some(w => w.toLowerCase() === lowerWord)) {
        // Use the case from alwaysCapitalize
        const matchedWord = options.alwaysCapitalize.find(w => w.toLowerCase() === lowerWord);
        processedPart += matchedWord || capitalizeWord(word, options);
        continue;
      }
      
      // Never capitalize words in the neverCapitalize list
      if (options.neverCapitalize?.some(w => w.toLowerCase() === lowerWord)) {
        // Use the case from neverCapitalize or lowercase
        const matchedWord = options.neverCapitalize.find(w => w.toLowerCase() === lowerWord);
        processedPart += matchedWord || lowerWord;
        continue;
      }
      
      // Regular word, add in lowercase
      processedPart += lowerWord;
    }
    
    // If we need to capitalize this part
    if (capitalizeNext && processedPart) {
      // Find the first character that's a letter
      const match = processedPart.match(/[a-z]/i);
      
      if (match) {
        const index = match.index!;
        const firstChar = processedPart[index].toUpperCase();
        result += processedPart.slice(0, index) + firstChar + processedPart.slice(index + 1);
      } else {
        // No letters found, just add the part as is
        result += processedPart;
      }
      
      capitalizeNext = false;
    } else {
      // Not the start of a sentence, add as is
      result += processedPart;
    }
  }
  
  return result;
}

/**
 * Helper function to capitalize a word with options for acronym preservation
 * 
 * @param word The word to capitalize
 * @param options Conversion options
 * @returns The capitalized word
 */
function capitalizeWord(word: string, options: ConversionOptions = {}): string {
  // If the word is empty, return it
  if (!word) return word;
  
  // Check if the word is an acronym (all uppercase)
  if (options.preserveAcronyms !== false && isAcronym(word)) {
    return word;
  }
  
  // Capitalize the first letter and lowercase the rest
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Check if a word is an acronym (all uppercase)
 * 
 * @param word The word to check
 * @returns True if the word is an acronym
 */
function isAcronym(word: string): boolean {
  // A word is considered an acronym if:
  // 1. It's at least 2 characters long
  // 2. It's all uppercase
  // 3. It contains at least one letter
  return word.length >= 2 && 
         word === word.toUpperCase() && 
         /[A-Z]/.test(word);
}

/**
 * Convert text to camelCase
 * 
 * @param text The input text to convert
 * @returns The text in camelCase
 */
export function toCamelCase(text: string): string {
  if (!text) return text;
  
  // First, normalize the text by replacing non-alphanumeric characters with spaces
  // and removing consecutive spaces
  const normalized = text
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .replace(/[^\w\s]/g, ' ') // Replace other non-alphanumeric chars with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();
  
  // Split the text into words
  const words = normalized.split(' ');
  
  // Handle empty array case
  if (words.length === 0) return '';
  
  // Convert the first word to lowercase
  const firstWord = words[0].toLowerCase();
  
  // Convert the rest of the words to title case (first letter uppercase, rest lowercase)
  const restWords = words.slice(1).map(word => {
    // Skip empty words
    if (!word) return '';
    
    // Handle words that are just numbers
    if (/^\d+$/.test(word)) return word;
    
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  // Join all words together without spaces
  return [firstWord, ...restWords].join('');
}

/**
 * Convert text to PascalCase
 * 
 * @param text The input text to convert
 * @returns The text in PascalCase
 */
export function toPascalCase(text: string): string {
  if (!text) return text;
  
  // First, normalize the text by replacing non-alphanumeric characters with spaces
  // and removing consecutive spaces
  const normalized = text
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .replace(/[^\w\s]/g, ' ') // Replace other non-alphanumeric chars with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();
  
  // Split the text into words
  const words = normalized.split(' ');
  
  // Convert all words to title case (first letter uppercase, rest lowercase)
  const pascalWords = words.map(word => {
    // Skip empty words
    if (!word) return '';
    
    // Handle words that are just numbers
    if (/^\d+$/.test(word)) return word;
    
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  // Join all words together without spaces
  return pascalWords.join('');
}

/**
 * Convert text to snake_case
 * 
 * @param text The input text to convert
 * @returns The text in snake_case
 */
export function toSnakeCase(text: string): string {
  if (!text) return text;
  
  // Handle camelCase and PascalCase input by inserting spaces before capital letters
  const withSpaces = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  
  // First, normalize the text by replacing non-alphanumeric characters with spaces
  // and removing consecutive spaces
  const normalized = withSpaces
    .replace(/[-]/g, ' ') // Replace hyphens with spaces
    .replace(/[^\w\s]/g, ' ') // Replace other non-alphanumeric chars with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();
  
  // Convert to lowercase and replace spaces with underscores
  return normalized.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Convert text to kebab-case
 * 
 * @param text The input text to convert
 * @returns The text in kebab-case
 */
export function toKebabCase(text: string): string {
  if (!text) return text;
  
  // Handle camelCase and PascalCase input by inserting spaces before capital letters
  const withSpaces = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  
  // First, normalize the text by replacing non-alphanumeric characters with spaces
  // and removing consecutive spaces
  const normalized = withSpaces
    .replace(/[_]/g, ' ') // Replace underscores with spaces
    .replace(/[^\w\s-]/g, ' ') // Replace other non-alphanumeric chars with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();
  
  // Convert to lowercase and replace spaces with hyphens
  return normalized.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Convert text to CONSTANT_CASE
 * 
 * @param text The input text to convert
 * @returns The text in CONSTANT_CASE
 */
export function toConstantCase(text: string): string {
  if (!text) return text;
  
  // Handle camelCase and PascalCase input by inserting spaces before capital letters
  const withSpaces = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  
  // First, normalize the text by replacing non-alphanumeric characters with spaces
  // and removing consecutive spaces
  const normalized = withSpaces
    .replace(/[-]/g, ' ') // Replace hyphens with spaces
    .replace(/[^\w\s]/g, ' ') // Replace other non-alphanumeric chars with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();
  
  // Convert to uppercase and replace spaces with underscores
  return normalized.toUpperCase().replace(/\s+/g, '_');
}

/**
 * Process multi-line text by applying the conversion function to each line
 * 
 * @param text The multi-line text to process
 * @param conversionFn The function to apply to each line
 * @returns The processed text with preserved line breaks
 */
export function processMultilineText(
  text: string,
  conversionFn: (line: string) => string
): string {
  if (!text) return text;
  
  // Split the text into lines
  const lines = text.split(/(\r?\n)/);
  const result: string[] = [];
  
  // Process each line and preserve line breaks
  for (let i = 0; i < lines.length; i++) {
    const part = lines[i];
    
    // If this is a line break, add it as is
    if (i % 2 === 1) {
      result.push(part);
      continue;
    }
    
    // Process the line
    result.push(conversionFn(part));
  }
  
  return result.join('');
}

/**
 * Convert text to the specified case format
 * 
 * @param text The input text to convert
 * @param format The target case format
 * @param options Additional conversion options
 * @returns The converted text
 */
export function convertCase(
  text: string,
  format: CaseFormat,
  options: ConversionOptions = {}
): string {
  if (!text) return text;
  
  // Define the conversion function based on the format
  let conversionFn: (text: string) => string;
  
  switch (format) {
    case CaseFormat.UPPER:
      conversionFn = (line: string) => toUpperCase(line);
      break;
    case CaseFormat.LOWER:
      conversionFn = (line: string) => toLowerCase(line);
      break;
    case CaseFormat.TITLE:
      conversionFn = (line: string) => toTitleCase(line, options);
      break;
    case CaseFormat.SENTENCE:
      conversionFn = (line: string) => toSentenceCase(line, options);
      break;
    case CaseFormat.CAMEL:
      conversionFn = (line: string) => toCamelCase(line);
      break;
    case CaseFormat.PASCAL:
      conversionFn = (line: string) => toPascalCase(line);
      break;
    case CaseFormat.SNAKE:
      conversionFn = (line: string) => toSnakeCase(line);
      break;
    case CaseFormat.KEBAB:
      conversionFn = (line: string) => toKebabCase(line);
      break;
    case CaseFormat.CONSTANT:
      conversionFn = (line: string) => toConstantCase(line);
      break;
    default:
      return text;
  }
  
  // Process the text line by line
  return processMultilineText(text, conversionFn);
}