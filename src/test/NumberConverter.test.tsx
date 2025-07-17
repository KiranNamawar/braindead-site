import { describe, it, expect } from 'vitest';

// Test the core conversion logic
describe('Number Base Converter', () => {
  // Test decimal to binary conversion
  it('converts decimal to binary correctly', () => {
    expect(parseInt('42', 10).toString(2)).toBe('101010');
    expect(parseInt('255', 10).toString(2)).toBe('11111111');
    expect(parseInt('1', 10).toString(2)).toBe('1');
  });

  // Test binary to decimal conversion
  it('converts binary to decimal correctly', () => {
    expect(parseInt('101010', 2)).toBe(42);
    expect(parseInt('11111111', 2)).toBe(255);
    expect(parseInt('1', 2)).toBe(1);
  });

  // Test decimal to hexadecimal conversion
  it('converts decimal to hexadecimal correctly', () => {
    expect(parseInt('42', 10).toString(16).toUpperCase()).toBe('2A');
    expect(parseInt('255', 10).toString(16).toUpperCase()).toBe('FF');
    expect(parseInt('1', 10).toString(16).toUpperCase()).toBe('1');
  });

  // Test hexadecimal to decimal conversion
  it('converts hexadecimal to decimal correctly', () => {
    expect(parseInt('2A', 16)).toBe(42);
    expect(parseInt('FF', 16)).toBe(255);
    expect(parseInt('1', 16)).toBe(1);
  });

  // Test decimal to octal conversion
  it('converts decimal to octal correctly', () => {
    expect(parseInt('42', 10).toString(8)).toBe('52');
    expect(parseInt('255', 10).toString(8)).toBe('377');
    expect(parseInt('1', 10).toString(8)).toBe('1');
  });

  // Test octal to decimal conversion
  it('converts octal to decimal correctly', () => {
    expect(parseInt('52', 8)).toBe(42);
    expect(parseInt('377', 8)).toBe(255);
    expect(parseInt('1', 8)).toBe(1);
  });
});

describe('Roman Numeral Converter', () => {
  // Test decimal to roman conversion
  it('converts decimal to roman correctly', () => {
    const decimalToRoman = (num: number): string => {
      const romanNumerals = [
        { symbol: 'M', value: 1000 },
        { symbol: 'CM', value: 900 },
        { symbol: 'D', value: 500 },
        { symbol: 'CD', value: 400 },
        { symbol: 'C', value: 100 },
        { symbol: 'XC', value: 90 },
        { symbol: 'L', value: 50 },
        { symbol: 'XL', value: 40 },
        { symbol: 'X', value: 10 },
        { symbol: 'IX', value: 9 },
        { symbol: 'V', value: 5 },
        { symbol: 'IV', value: 4 },
        { symbol: 'I', value: 1 }
      ];

      let remaining = num;
      let result = '';

      for (const { symbol, value } of romanNumerals) {
        while (remaining >= value) {
          result += symbol;
          remaining -= value;
        }
      }

      return result;
    };

    expect(decimalToRoman(42)).toBe('XLII');
    expect(decimalToRoman(1984)).toBe('MCMLXXXIV');
    expect(decimalToRoman(2024)).toBe('MMXXIV');
    expect(decimalToRoman(1)).toBe('I');
    expect(decimalToRoman(3999)).toBe('MMMCMXCIX');
  });

  // Test roman to decimal conversion
  it('converts roman to decimal correctly', () => {
    const romanToDecimal = (roman: string): number => {
      const romanValues: { [key: string]: number } = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50,
        'C': 100, 'D': 500, 'M': 1000
      };

      let result = 0;
      let prevValue = 0;

      for (let i = roman.length - 1; i >= 0; i--) {
        const currentValue = romanValues[roman[i]];
        if (currentValue < prevValue) {
          result -= currentValue;
        } else {
          result += currentValue;
        }
        prevValue = currentValue;
      }

      return result;
    };

    expect(romanToDecimal('XLII')).toBe(42);
    expect(romanToDecimal('MCMLXXXIV')).toBe(1984);
    expect(romanToDecimal('MMXXIV')).toBe(2024);
    expect(romanToDecimal('I')).toBe(1);
    expect(romanToDecimal('MMMCMXCIX')).toBe(3999);
  });

  // Test validation patterns
  it('validates roman numeral patterns', () => {
    const isValidRoman = (roman: string): boolean => {
      const invalidPatterns = [
        /IIII/, /VV/, /XXXX/, /LL/, /CCCC/, /DD/, /MMMM/,
        /VX/, /VL/, /VC/, /VD/, /VM/,
        /LC/, /LD/, /LM/,
        /DM/,
        /IL/, /IC/, /ID/, /IM/,
        /XD/, /XM/
      ];

      return /^[IVXLCDM]+$/.test(roman) && 
             !invalidPatterns.some(pattern => pattern.test(roman));
    };

    expect(isValidRoman('XLII')).toBe(true);
    expect(isValidRoman('MCMLXXXIV')).toBe(true);
    expect(isValidRoman('IIII')).toBe(false); // Invalid: more than 3 consecutive I's
    expect(isValidRoman('VV')).toBe(false);   // Invalid: V cannot be repeated
    expect(isValidRoman('IL')).toBe(false);   // Invalid: I can only subtract from V and X
  });
});