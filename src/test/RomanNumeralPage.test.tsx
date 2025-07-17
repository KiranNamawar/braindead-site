import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import RomanNumeralPage from '../pages/RomanNumeralPage';
import { ToastProvider } from '../components/ToastContainer';

// Mock analytics
vi.mock('../utils/analytics', () => ({
  trackToolUsage: vi.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <HelmetProvider>
        <ToastProvider>
          {component}
        </ToastProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
};

describe('Roman Numeral Converter', () => {
  test('renders roman numeral converter interface', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    expect(screen.getByText('Roman Numeral Converter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter a number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter roman numerals/i)).toBeInTheDocument();
    expect(screen.getByText('Convert to Roman')).toBeInTheDocument();
    expect(screen.getByText('Convert to Number')).toBeInTheDocument();
  });

  test('converts number to roman numerals', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertToRomanButton = screen.getByText('Convert to Roman');
    
    fireEvent.change(numberInput, { target: { value: '42' } });
    fireEvent.click(convertToRomanButton);
    
    expect(screen.getByDisplayValue('XLII')).toBeInTheDocument();
  });

  test('converts roman numerals to number', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const romanInput = screen.getByPlaceholderText(/enter roman numerals/i);
    const convertToNumberButton = screen.getByText('Convert to Number');
    
    fireEvent.change(romanInput, { target: { value: 'XLII' } });
    fireEvent.click(convertToNumberButton);
    
    expect(screen.getByDisplayValue('42')).toBeInTheDocument();
  });

  test('handles basic roman numerals', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const testCases = [
      { number: '1', roman: 'I' },
      { number: '5', roman: 'V' },
      { number: '10', roman: 'X' },
      { number: '50', roman: 'L' },
      { number: '100', roman: 'C' },
      { number: '500', roman: 'D' },
      { number: '1000', roman: 'M' },
    ];
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertButton = screen.getByText('Convert to Roman');
    
    testCases.forEach(({ number, roman }) => {
      fireEvent.change(numberInput, { target: { value: number } });
      fireEvent.click(convertButton);
      expect(screen.getByDisplayValue(roman)).toBeInTheDocument();
    });
  });

  test('handles subtractive notation', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const testCases = [
      { number: '4', roman: 'IV' },
      { number: '9', roman: 'IX' },
      { number: '40', roman: 'XL' },
      { number: '90', roman: 'XC' },
      { number: '400', roman: 'CD' },
      { number: '900', roman: 'CM' },
    ];
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertButton = screen.getByText('Convert to Roman');
    
    testCases.forEach(({ number, roman }) => {
      fireEvent.change(numberInput, { target: { value: number } });
      fireEvent.click(convertButton);
      expect(screen.getByDisplayValue(roman)).toBeInTheDocument();
    });
  });

  test('handles complex numbers', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const testCases = [
      { number: '1994', roman: 'MCMXCIV' },
      { number: '2023', roman: 'MMXXIII' },
      { number: '3999', roman: 'MMMCMXCIX' },
    ];
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertButton = screen.getByText('Convert to Roman');
    
    testCases.forEach(({ number, roman }) => {
      fireEvent.change(numberInput, { target: { value: number } });
      fireEvent.click(convertButton);
      expect(screen.getByDisplayValue(roman)).toBeInTheDocument();
    });
  });

  test('validates number input range', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertButton = screen.getByText('Convert to Roman');
    
    // Test zero
    fireEvent.change(numberInput, { target: { value: '0' } });
    fireEvent.click(convertButton);
    expect(screen.getByText(/number must be between 1 and 3999/i)).toBeInTheDocument();
    
    // Test negative number
    fireEvent.change(numberInput, { target: { value: '-5' } });
    fireEvent.click(convertButton);
    expect(screen.getByText(/number must be between 1 and 3999/i)).toBeInTheDocument();
    
    // Test number too large
    fireEvent.change(numberInput, { target: { value: '4000' } });
    fireEvent.click(convertButton);
    expect(screen.getByText(/number must be between 1 and 3999/i)).toBeInTheDocument();
  });

  test('validates roman numeral input', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const romanInput = screen.getByPlaceholderText(/enter roman numerals/i);
    const convertButton = screen.getByText('Convert to Number');
    
    // Test invalid characters
    fireEvent.change(romanInput, { target: { value: 'ABC' } });
    fireEvent.click(convertButton);
    expect(screen.getByText(/invalid roman numeral/i)).toBeInTheDocument();
    
    // Test invalid format
    fireEvent.change(romanInput, { target: { value: 'IIII' } });
    fireEvent.click(convertButton);
    expect(screen.getByText(/invalid roman numeral format/i)).toBeInTheDocument();
  });

  test('handles case insensitive roman numerals', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const romanInput = screen.getByPlaceholderText(/enter roman numerals/i);
    const convertButton = screen.getByText('Convert to Number');
    
    fireEvent.change(romanInput, { target: { value: 'xlii' } });
    fireEvent.click(convertButton);
    
    expect(screen.getByDisplayValue('42')).toBeInTheDocument();
  });

  test('handles empty input validation', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const convertToRomanButton = screen.getByText('Convert to Roman');
    const convertToNumberButton = screen.getByText('Convert to Number');
    
    fireEvent.click(convertToRomanButton);
    expect(screen.getByText(/please enter a number/i)).toBeInTheDocument();
    
    fireEvent.click(convertToNumberButton);
    expect(screen.getByText(/please enter roman numerals/i)).toBeInTheDocument();
  });

  test('copies result to clipboard', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertButton = screen.getByText('Convert to Roman');
    
    fireEvent.change(numberInput, { target: { value: '42' } });
    fireEvent.click(convertButton);
    
    const copyButton = screen.getByText('Copy Roman');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('XLII');
  });

  test('clears all inputs and outputs', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertButton = screen.getByText('Convert to Roman');
    
    fireEvent.change(numberInput, { target: { value: '42' } });
    fireEvent.click(convertButton);
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(numberInput).toHaveValue('');
    expect(screen.getByPlaceholderText(/enter roman numerals/i)).toHaveValue('');
  });

  test('shows conversion explanation', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertButton = screen.getByText('Convert to Roman');
    
    fireEvent.change(numberInput, { target: { value: '1994' } });
    fireEvent.click(convertButton);
    
    expect(screen.getByText('Conversion Steps')).toBeInTheDocument();
    expect(screen.getByText(/1000 = M/i)).toBeInTheDocument();
    expect(screen.getByText(/900 = CM/i)).toBeInTheDocument();
  });

  test('provides roman numeral rules explanation', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    expect(screen.getByText(/roman numeral rules/i)).toBeInTheDocument();
    expect(screen.getByText(/I = 1/i)).toBeInTheDocument();
    expect(screen.getByText(/V = 5/i)).toBeInTheDocument();
    expect(screen.getByText(/X = 10/i)).toBeInTheDocument();
  });

  test('shows historical context', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    expect(screen.getByText(/about roman numerals/i)).toBeInTheDocument();
    expect(screen.getByText(/ancient rome/i)).toBeInTheDocument();
  });

  test('handles batch conversion', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const batchInput = screen.getByPlaceholderText(/enter numbers separated by commas/i);
    const batchConvertButton = screen.getByText('Batch Convert');
    
    fireEvent.change(batchInput, { target: { value: '1, 5, 10, 50' } });
    fireEvent.click(batchConvertButton);
    
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText('V')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  test('validates batch input', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const batchInput = screen.getByPlaceholderText(/enter numbers separated by commas/i);
    const batchConvertButton = screen.getByText('Batch Convert');
    
    fireEvent.change(batchInput, { target: { value: '1, abc, 10' } });
    fireEvent.click(batchConvertButton);
    
    expect(screen.getByText(/invalid number.*abc/i)).toBeInTheDocument();
  });

  test('downloads conversion results', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const batchInput = screen.getByPlaceholderText(/enter numbers separated by commas/i);
    const batchConvertButton = screen.getByText('Batch Convert');
    
    fireEvent.change(batchInput, { target: { value: '1, 5, 10' } });
    fireEvent.click(batchConvertButton);
    
    const downloadButton = screen.getByText('Download Results');
    fireEvent.click(downloadButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('shows random number generator', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const randomButton = screen.getByText('Random Number');
    fireEvent.click(randomButton);
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    expect(numberInput.value).toMatch(/^\d+$/);
    expect(parseInt(numberInput.value)).toBeGreaterThan(0);
    expect(parseInt(numberInput.value)).toBeLessThan(4000);
  });

  test('handles invalid roman numeral sequences', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const romanInput = screen.getByPlaceholderText(/enter roman numerals/i);
    const convertButton = screen.getByText('Convert to Number');
    
    const invalidCases = ['IIIII', 'VV', 'LL', 'DD', 'IC', 'IM', 'XM'];
    
    invalidCases.forEach(invalid => {
      fireEvent.change(romanInput, { target: { value: invalid } });
      fireEvent.click(convertButton);
      expect(screen.getByText(/invalid roman numeral/i)).toBeInTheDocument();
    });
  });

  test('shows conversion history', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertButton = screen.getByText('Convert to Roman');
    
    fireEvent.change(numberInput, { target: { value: '42' } });
    fireEvent.click(convertButton);
    
    expect(screen.getByText('Conversion History')).toBeInTheDocument();
    expect(screen.getByText('42 → XLII')).toBeInTheDocument();
  });

  test('clears conversion history', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertButton = screen.getByText('Convert to Roman');
    
    fireEvent.change(numberInput, { target: { value: '42' } });
    fireEvent.click(convertButton);
    
    const clearHistoryButton = screen.getByText('Clear History');
    fireEvent.click(clearHistoryButton);
    
    expect(screen.queryByText('42 → XLII')).not.toBeInTheDocument();
  });

  test('handles decimal input validation', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    const convertButton = screen.getByText('Convert to Roman');
    
    fireEvent.change(numberInput, { target: { value: '42.5' } });
    fireEvent.click(convertButton);
    
    expect(screen.getByText(/please enter a whole number/i)).toBeInTheDocument();
  });

  test('provides keyboard shortcuts', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const numberInput = screen.getByPlaceholderText(/enter a number/i);
    fireEvent.change(numberInput, { target: { value: '42' } });
    
    // Enter key should trigger conversion
    fireEvent.keyDown(numberInput, { key: 'Enter' });
    
    expect(screen.getByDisplayValue('XLII')).toBeInTheDocument();
  });

  test('shows year conversion examples', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    expect(screen.getByText('Common Years')).toBeInTheDocument();
    expect(screen.getByText('2024 = MMXXIV')).toBeInTheDocument();
    expect(screen.getByText('1776 = MDCCLXXVI')).toBeInTheDocument();
  });

  test('handles whitespace in roman numeral input', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const romanInput = screen.getByPlaceholderText(/enter roman numerals/i);
    const convertButton = screen.getByText('Convert to Number');
    
    fireEvent.change(romanInput, { target: { value: ' X L I I ' } });
    fireEvent.click(convertButton);
    
    expect(screen.getByDisplayValue('42')).toBeInTheDocument();
  });
});