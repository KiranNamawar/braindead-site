import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import TextCaseConverterPage from '../pages/TextCaseConverterPage';
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

describe('Text Case Converter', () => {
  test('renders text case converter interface', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    expect(screen.getByText('Text Case Converter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your text/i)).toBeInTheDocument();
    expect(screen.getByText('UPPERCASE')).toBeInTheDocument();
    expect(screen.getByText('lowercase')).toBeInTheDocument();
    expect(screen.getByText('Title Case')).toBeInTheDocument();
    expect(screen.getByText('camelCase')).toBeInTheDocument();
  });

  test('converts text to uppercase', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(uppercaseButton);
    
    expect(screen.getByDisplayValue('HELLO WORLD')).toBeInTheDocument();
  });

  test('converts text to lowercase', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const lowercaseButton = screen.getByText('lowercase');
    
    fireEvent.change(textInput, { target: { value: 'HELLO WORLD' } });
    fireEvent.click(lowercaseButton);
    
    expect(screen.getByDisplayValue('hello world')).toBeInTheDocument();
  });

  test('converts text to title case', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const titleCaseButton = screen.getByText('Title Case');
    
    fireEvent.change(textInput, { target: { value: 'hello world test' } });
    fireEvent.click(titleCaseButton);
    
    expect(screen.getByDisplayValue('Hello World Test')).toBeInTheDocument();
  });

  test('converts text to camelCase', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const camelCaseButton = screen.getByText('camelCase');
    
    fireEvent.change(textInput, { target: { value: 'hello world test' } });
    fireEvent.click(camelCaseButton);
    
    expect(screen.getByDisplayValue('helloWorldTest')).toBeInTheDocument();
  });

  test('converts text to PascalCase', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const pascalCaseButton = screen.getByText('PascalCase');
    
    fireEvent.change(textInput, { target: { value: 'hello world test' } });
    fireEvent.click(pascalCaseButton);
    
    expect(screen.getByDisplayValue('HelloWorldTest')).toBeInTheDocument();
  });

  test('converts text to snake_case', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const snakeCaseButton = screen.getByText('snake_case');
    
    fireEvent.change(textInput, { target: { value: 'hello world test' } });
    fireEvent.click(snakeCaseButton);
    
    expect(screen.getByDisplayValue('hello_world_test')).toBeInTheDocument();
  });

  test('converts text to kebab-case', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const kebabCaseButton = screen.getByText('kebab-case');
    
    fireEvent.change(textInput, { target: { value: 'hello world test' } });
    fireEvent.click(kebabCaseButton);
    
    expect(screen.getByDisplayValue('hello-world-test')).toBeInTheDocument();
  });

  test('converts text to CONSTANT_CASE', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const constantCaseButton = screen.getByText('CONSTANT_CASE');
    
    fireEvent.change(textInput, { target: { value: 'hello world test' } });
    fireEvent.click(constantCaseButton);
    
    expect(screen.getByDisplayValue('HELLO_WORLD_TEST')).toBeInTheDocument();
  });

  test('handles empty input', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const uppercaseButton = screen.getByText('UPPERCASE');
    fireEvent.click(uppercaseButton);
    
    expect(screen.getByText(/please enter some text/i)).toBeInTheDocument();
  });

  test('handles special characters', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const titleCaseButton = screen.getByText('Title Case');
    
    fireEvent.change(textInput, { target: { value: 'hello-world_test.example' } });
    fireEvent.click(titleCaseButton);
    
    expect(screen.getByDisplayValue('Hello-World_Test.Example')).toBeInTheDocument();
  });

  test('handles numbers in text', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const camelCaseButton = screen.getByText('camelCase');
    
    fireEvent.change(textInput, { target: { value: 'hello world 123 test' } });
    fireEvent.click(camelCaseButton);
    
    expect(screen.getByDisplayValue('helloWorld123Test')).toBeInTheDocument();
  });

  test('handles unicode characters', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(textInput, { target: { value: 'café naïve résumé' } });
    fireEvent.click(uppercaseButton);
    
    expect(screen.getByDisplayValue('CAFÉ NAÏVE RÉSUMÉ')).toBeInTheDocument();
  });

  test('copies converted text to clipboard', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(uppercaseButton);
    
    const copyButton = screen.getByText('Copy Result');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('HELLO WORLD');
  });

  test('clears input text', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(textInput).toHaveValue('');
  });

  test('shows character and word count', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    fireEvent.change(textInput, { target: { value: 'hello world test' } });
    
    expect(screen.getByText(/3.*words/i)).toBeInTheDocument();
    expect(screen.getByText(/16.*characters/i)).toBeInTheDocument();
  });

  test('handles batch conversion', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const batchInput = screen.getByPlaceholderText(/enter multiple lines/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(batchInput, { target: { value: 'hello world\ntest line\nanother line' } });
    fireEvent.click(uppercaseButton);
    
    const result = screen.getByDisplayValue(/HELLO WORLD\nTEST LINE\nANOTHER LINE/);
    expect(result).toBeInTheDocument();
  });

  test('preserves line breaks in batch mode', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const batchInput = screen.getByPlaceholderText(/enter multiple lines/i);
    const titleCaseButton = screen.getByText('Title Case');
    
    fireEvent.change(batchInput, { target: { value: 'first line\nsecond line\nthird line' } });
    fireEvent.click(titleCaseButton);
    
    const result = screen.getByDisplayValue(/First Line\nSecond Line\nThird Line/);
    expect(result).toBeInTheDocument();
  });

  test('handles alternating case', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const alternatingButton = screen.getByText('aLtErNaTiNg');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(alternatingButton);
    
    expect(screen.getByDisplayValue('hElLo WoRlD')).toBeInTheDocument();
  });

  test('handles inverse case', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const inverseButton = screen.getByText('iNVERSE cASE');
    
    fireEvent.change(textInput, { target: { value: 'Hello World' } });
    fireEvent.click(inverseButton);
    
    expect(screen.getByDisplayValue('hELLO wORLD')).toBeInTheDocument();
  });

  test('handles sentence case', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const sentenceCaseButton = screen.getByText('Sentence case');
    
    fireEvent.change(textInput, { target: { value: 'hello world. this is a test.' } });
    fireEvent.click(sentenceCaseButton);
    
    expect(screen.getByDisplayValue('Hello world. This is a test.')).toBeInTheDocument();
  });

  test('downloads converted text as file', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(uppercaseButton);
    
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('shows conversion history', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(uppercaseButton);
    
    expect(screen.getByText('Conversion History')).toBeInTheDocument();
    expect(screen.getByText('hello world → HELLO WORLD')).toBeInTheDocument();
  });

  test('handles very long text', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const longText = 'word '.repeat(1000);
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(textInput, { target: { value: longText } });
    fireEvent.click(uppercaseButton);
    
    expect(screen.getByDisplayValue(longText.toUpperCase())).toBeInTheDocument();
  });

  test('handles mixed case input for camelCase', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const camelCaseButton = screen.getByText('camelCase');
    
    fireEvent.change(textInput, { target: { value: 'HeLLo WoRLd TeST' } });
    fireEvent.click(camelCaseButton);
    
    expect(screen.getByDisplayValue('helloWorldTest')).toBeInTheDocument();
  });

  test('handles punctuation in title case', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const titleCaseButton = screen.getByText('Title Case');
    
    fireEvent.change(textInput, { target: { value: 'hello, world! how are you?' } });
    fireEvent.click(titleCaseButton);
    
    expect(screen.getByDisplayValue('Hello, World! How Are You?')).toBeInTheDocument();
  });

  test('shows preview before conversion', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    
    // Hover over uppercase button to see preview
    const uppercaseButton = screen.getByText('UPPERCASE');
    fireEvent.mouseEnter(uppercaseButton);
    
    expect(screen.getByText('Preview: HELLO WORLD')).toBeInTheDocument();
  });

  test('handles tab-separated values', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(textInput, { target: { value: 'hello\tworld\ttest' } });
    fireEvent.click(uppercaseButton);
    
    expect(screen.getByDisplayValue('HELLO\tWORLD\tTEST')).toBeInTheDocument();
  });

  test('provides keyboard shortcuts', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    
    // Ctrl+U for uppercase
    fireEvent.keyDown(textInput, { key: 'u', ctrlKey: true });
    
    expect(screen.getByDisplayValue('HELLO WORLD')).toBeInTheDocument();
  });

  test('shows case conversion examples', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    expect(screen.getByText('Examples')).toBeInTheDocument();
    expect(screen.getByText('hello world → HELLO WORLD')).toBeInTheDocument();
    expect(screen.getByText('hello world → helloWorld')).toBeInTheDocument();
  });

  test('handles emoji in text', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(textInput, { target: { value: 'hello 🌍 world 🚀' } });
    fireEvent.click(uppercaseButton);
    
    expect(screen.getByDisplayValue('HELLO 🌍 WORLD 🚀')).toBeInTheDocument();
  });

  test('handles multiple spaces and formatting', () => {
    renderWithProviders(<TextCaseConverterPage />);
    
    const textInput = screen.getByPlaceholderText(/enter your text/i);
    const camelCaseButton = screen.getByText('camelCase');
    
    fireEvent.change(textInput, { target: { value: '  hello    world   test  ' } });
    fireEvent.click(camelCaseButton);
    
    expect(screen.getByDisplayValue('helloWorldTest')).toBeInTheDocument();
  });
});