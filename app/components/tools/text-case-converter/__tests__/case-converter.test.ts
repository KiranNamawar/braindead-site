import { describe, it, expect } from 'vitest';
import { 
  toUpperCase, 
  toLowerCase, 
  toTitleCase, 
  toSentenceCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toConstantCase,
  convertCase
} from '../case-converter';
import { CaseFormat } from '../types';

describe('Basic Case Conversion Utilities', () => {
  describe('toUpperCase', () => {
    it('should convert text to uppercase', () => {
      expect(toUpperCase('hello world')).toBe('HELLO WORLD');
      expect(toUpperCase('Hello World')).toBe('HELLO WORLD');
      expect(toUpperCase('HELLO WORLD')).toBe('HELLO WORLD');
      expect(toUpperCase('')).toBe('');
    });

    it('should handle special characters and numbers', () => {
      expect(toUpperCase('hello123')).toBe('HELLO123');
      expect(toUpperCase('hello-world!')).toBe('HELLO-WORLD!');
      expect(toUpperCase('hello_world')).toBe('HELLO_WORLD');
    });
  });

  describe('toLowerCase', () => {
    it('should convert text to lowercase', () => {
      expect(toLowerCase('HELLO WORLD')).toBe('hello world');
      expect(toLowerCase('Hello World')).toBe('hello world');
      expect(toLowerCase('hello world')).toBe('hello world');
      expect(toLowerCase('')).toBe('');
    });

    it('should handle special characters and numbers', () => {
      expect(toLowerCase('HELLO123')).toBe('hello123');
      expect(toLowerCase('HELLO-WORLD!')).toBe('hello-world!');
      expect(toLowerCase('HELLO_WORLD')).toBe('hello_world');
    });
  });

  describe('toTitleCase', () => {
    it('should convert text to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD', { preserveAcronyms: false })).toBe('Hello World');
      expect(toTitleCase('hello WORLD', { preserveAcronyms: false })).toBe('Hello World');
      expect(toTitleCase('')).toBe('');
    });

    it('should not capitalize minor words except at the beginning or end', () => {
      expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox');
      expect(toTitleCase('a tale of two cities')).toBe('A Tale of Two Cities');
      expect(toTitleCase('to be or not to be')).toBe('To Be or Not to Be');
    });

    it('should handle multiple spaces', () => {
      expect(toTitleCase('hello  world')).toBe('Hello  World');
      expect(toTitleCase('  hello world  ')).toBe('  Hello World  ');
    });

    it('should preserve acronyms when option is enabled', () => {
      expect(toTitleCase('NASA launched a rocket', { preserveAcronyms: true })).toBe('NASA Launched a Rocket');
      expect(toTitleCase('the API documentation', { preserveAcronyms: true })).toBe('The API Documentation');
      expect(toTitleCase('NASA launched a rocket', { preserveAcronyms: false })).toBe('Nasa Launched a Rocket');
    });

    it('should respect alwaysCapitalize option', () => {
      expect(toTitleCase('earth and mars', { alwaysCapitalize: ['Mars'] })).toBe('Earth and Mars');
      expect(toTitleCase('the iphone and android', { alwaysCapitalize: ['iPhone'] })).toBe('The iPhone and Android');
    });

    it('should respect neverCapitalize option', () => {
      expect(toTitleCase('the iphone and android', { neverCapitalize: ['android'], alwaysCapitalize: ['iPhone'] })).toBe('The iPhone and android');
      expect(toTitleCase('javascript and python', { neverCapitalize: ['javascript'] })).toBe('javascript and Python');
    });
  });

  describe('toSentenceCase', () => {
    it('should convert text to sentence case', () => {
      expect(toSentenceCase('hello world')).toBe('Hello world');
      expect(toSentenceCase('HELLO WORLD')).toBe('HELLO WORLD');
      expect(toSentenceCase('hello WORLD')).toBe('Hello WORLD');
      expect(toSentenceCase('')).toBe('');
    });

    it('should capitalize the first letter of each sentence', () => {
      expect(toSentenceCase('hello world. how are you?')).toBe('Hello world. How are you?');
      expect(toSentenceCase('hello! nice to meet you. i am fine.')).toBe('Hello! Nice to meet you. I am fine.');
    });

    it('should handle sentences with no letters', () => {
      expect(toSentenceCase('123. 456')).toBe('123. 456');
      expect(toSentenceCase('!!!. ???')).toBe('!!!. ???');
    });

    it('should handle edge cases with punctuation', () => {
      expect(toSentenceCase('hello world.')).toBe('Hello world.');
      expect(toSentenceCase('hello world!')).toBe('Hello world!');
      expect(toSentenceCase('hello world?')).toBe('Hello world?');
    });
  });

  describe('toCamelCase', () => {
    it('should convert text to camelCase', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
      expect(toCamelCase('Hello World')).toBe('helloWorld');
      expect(toCamelCase('HELLO WORLD')).toBe('helloWorld');
      expect(toCamelCase('')).toBe('');
    });

    it('should handle special characters and multiple spaces', () => {
      expect(toCamelCase('hello-world')).toBe('helloWorld');
      expect(toCamelCase('hello_world')).toBe('helloWorld');
      expect(toCamelCase('hello   world')).toBe('helloWorld');
      expect(toCamelCase('  hello  world  ')).toBe('helloWorld');
    });

    it('should handle multi-word phrases', () => {
      expect(toCamelCase('the quick brown fox')).toBe('theQuickBrownFox');
      expect(toCamelCase('This is a test')).toBe('thisIsATest');
    });
  });

  describe('toPascalCase', () => {
    it('should convert text to PascalCase', () => {
      expect(toPascalCase('hello world')).toBe('HelloWorld');
      expect(toPascalCase('Hello World')).toBe('HelloWorld');
      expect(toPascalCase('HELLO WORLD')).toBe('HelloWorld');
      expect(toPascalCase('')).toBe('');
    });

    it('should handle special characters and multiple spaces', () => {
      expect(toPascalCase('hello-world')).toBe('HelloWorld');
      expect(toPascalCase('hello_world')).toBe('HelloWorld');
      expect(toPascalCase('hello   world')).toBe('HelloWorld');
      expect(toPascalCase('  hello  world  ')).toBe('HelloWorld');
    });

    it('should handle multi-word phrases', () => {
      expect(toPascalCase('the quick brown fox')).toBe('TheQuickBrownFox');
      expect(toPascalCase('This is a test')).toBe('ThisIsATest');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert text to snake_case', () => {
      expect(toSnakeCase('hello world')).toBe('hello_world');
      expect(toSnakeCase('Hello World')).toBe('hello_world');
      expect(toSnakeCase('HELLO WORLD')).toBe('hello_world');
      expect(toSnakeCase('')).toBe('');
    });

    it('should handle special characters and multiple spaces', () => {
      expect(toSnakeCase('hello-world')).toBe('hello_world');
      expect(toSnakeCase('hello_world')).toBe('hello_world');
      expect(toSnakeCase('hello   world')).toBe('hello_world');
      expect(toSnakeCase('  hello  world  ')).toBe('hello_world');
    });

    it('should handle multi-word phrases', () => {
      expect(toSnakeCase('the quick brown fox')).toBe('the_quick_brown_fox');
      expect(toSnakeCase('This is a test')).toBe('this_is_a_test');
    });
  });

  describe('toKebabCase', () => {
    it('should convert text to kebab-case', () => {
      expect(toKebabCase('hello world')).toBe('hello-world');
      expect(toKebabCase('Hello World')).toBe('hello-world');
      expect(toKebabCase('HELLO WORLD')).toBe('hello-world');
      expect(toKebabCase('')).toBe('');
    });

    it('should handle special characters and multiple spaces', () => {
      expect(toKebabCase('hello-world')).toBe('hello-world');
      expect(toKebabCase('hello_world')).toBe('hello-world');
      expect(toKebabCase('hello   world')).toBe('hello-world');
      expect(toKebabCase('  hello  world  ')).toBe('hello-world');
    });

    it('should handle multi-word phrases', () => {
      expect(toKebabCase('the quick brown fox')).toBe('the-quick-brown-fox');
      expect(toKebabCase('This is a test')).toBe('this-is-a-test');
    });
  });

  describe('toConstantCase', () => {
    it('should convert text to CONSTANT_CASE', () => {
      expect(toConstantCase('hello world')).toBe('HELLO_WORLD');
      expect(toConstantCase('Hello World')).toBe('HELLO_WORLD');
      expect(toConstantCase('HELLO WORLD')).toBe('HELLO_WORLD');
      expect(toConstantCase('')).toBe('');
    });

    it('should handle special characters and multiple spaces', () => {
      expect(toConstantCase('hello-world')).toBe('HELLO_WORLD');
      expect(toConstantCase('hello_world')).toBe('HELLO_WORLD');
      expect(toConstantCase('hello   world')).toBe('HELLO_WORLD');
      expect(toConstantCase('  hello  world  ')).toBe('HELLO_WORLD');
    });

    it('should handle multi-word phrases', () => {
      expect(toConstantCase('the quick brown fox')).toBe('THE_QUICK_BROWN_FOX');
      expect(toConstantCase('This is a test')).toBe('THIS_IS_A_TEST');
    });
  });

  describe('convertCase', () => {
    it('should convert to uppercase when format is UPPER', () => {
      expect(convertCase('hello world', CaseFormat.UPPER)).toBe('HELLO WORLD');
    });

    it('should convert to lowercase when format is LOWER', () => {
      expect(convertCase('HELLO WORLD', CaseFormat.LOWER)).toBe('hello world');
    });

    it('should convert to title case when format is TITLE', () => {
      expect(convertCase('hello world', CaseFormat.TITLE)).toBe('Hello World');
    });

    it('should convert to sentence case when format is SENTENCE', () => {
      expect(convertCase('hello world. another sentence.', CaseFormat.SENTENCE))
        .toBe('Hello world. Another sentence.');
    });

    it('should convert to camelCase when format is CAMEL', () => {
      expect(convertCase('hello world', CaseFormat.CAMEL)).toBe('helloWorld');
    });

    it('should convert to PascalCase when format is PASCAL', () => {
      expect(convertCase('hello world', CaseFormat.PASCAL)).toBe('HelloWorld');
    });

    it('should convert to snake_case when format is SNAKE', () => {
      expect(convertCase('hello world', CaseFormat.SNAKE)).toBe('hello_world');
    });

    it('should convert to kebab-case when format is KEBAB', () => {
      expect(convertCase('hello world', CaseFormat.KEBAB)).toBe('hello-world');
    });

    it('should convert to CONSTANT_CASE when format is CONSTANT', () => {
      expect(convertCase('hello world', CaseFormat.CONSTANT)).toBe('HELLO_WORLD');
    });

    it('should handle empty input', () => {
      expect(convertCase('', CaseFormat.UPPER)).toBe('');
      expect(convertCase('', CaseFormat.LOWER)).toBe('');
      expect(convertCase('', CaseFormat.TITLE)).toBe('');
      expect(convertCase('', CaseFormat.SENTENCE)).toBe('');
      expect(convertCase('', CaseFormat.CAMEL)).toBe('');
      expect(convertCase('', CaseFormat.PASCAL)).toBe('');
      expect(convertCase('', CaseFormat.SNAKE)).toBe('');
      expect(convertCase('', CaseFormat.KEBAB)).toBe('');
      expect(convertCase('', CaseFormat.CONSTANT)).toBe('');
    });

    it('should pass options to the appropriate conversion function', () => {
      const options = { preserveAcronyms: true, alwaysCapitalize: ['Mars'] };
      expect(convertCase('NASA went to mars', CaseFormat.TITLE, options))
        .toBe('NASA Went to Mars');
    });
  });
});