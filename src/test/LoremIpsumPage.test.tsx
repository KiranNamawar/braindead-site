import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import LoremIpsumPage from '../pages/LoremIpsumPage';
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

describe('Lorem Ipsum Generator', () => {
  test('renders lorem ipsum generator interface', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument();
    expect(screen.getByText('Words')).toBeInTheDocument();
    expect(screen.getByText('Sentences')).toBeInTheDocument();
    expect(screen.getByText('Paragraphs')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  test('generates lorem ipsum by words', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const wordsTab = screen.getByText('Words');
    const countInput = screen.getByLabelText(/count/i);
    const generateButton = screen.getByText('Generate');
    
    fireEvent.click(wordsTab);
    fireEvent.change(countInput, { target: { value: '10' } });
    fireEvent.click(generateButton);
    
    const output = screen.getByRole('textbox', { name: /generated text/i });
    expect(output.value.split(' ')).toHaveLength(10);
  });

  test('generates lorem ipsum by sentences', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const sentencesTab = screen.getByText('Sentences');
    const countInput = screen.getByLabelText(/count/i);
    const generateButton = screen.getByText('Generate');
    
    fireEvent.click(sentencesTab);
    fireEvent.change(countInput, { target: { value: '3' } });
    fireEvent.click(generateButton);
    
    const output = screen.getByRole('textbox', { name: /generated text/i });
    const sentences = output.value.split('.').filter(s => s.trim());
    expect(sentences).toHaveLength(3);
  });

  test('generates lorem ipsum by paragraphs', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const paragraphsTab = screen.getByText('Paragraphs');
    const countInput = screen.getByLabelText(/count/i);
    const generateButton = screen.getByText('Generate');
    
    fireEvent.click(paragraphsTab);
    fireEvent.change(countInput, { target: { value: '2' } });
    fireEvent.click(generateButton);
    
    const output = screen.getByRole('textbox', { name: /generated text/i });
    const paragraphs = output.value.split('\n\n').filter(p => p.trim());
    expect(paragraphs).toHaveLength(2);
  });

  test('validates input count', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    const generateButton = screen.getByText('Generate');
    
    fireEvent.change(countInput, { target: { value: '0' } });
    fireEvent.click(generateButton);
    
    expect(screen.getByText(/count must be greater than 0/i)).toBeInTheDocument();
  });

  test('handles maximum count limits', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    fireEvent.change(countInput, { target: { value: '1000' } });
    
    expect(countInput).toHaveValue(500); // Should cap at maximum
  });

  test('starts with lorem ipsum text', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const startWithLoremCheckbox = screen.getByLabelText(/start with.*lorem ipsum/i);
    const generateButton = screen.getByText('Generate');
    
    fireEvent.click(startWithLoremCheckbox);
    fireEvent.click(generateButton);
    
    const output = screen.getByRole('textbox', { name: /generated text/i });
    expect(output.value.toLowerCase()).toMatch(/^lorem ipsum/);
  });

  test('copies generated text to clipboard', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    
    const copyButton = screen.getByText('Copy Text');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('downloads generated text as file', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('clears generated text', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    const output = screen.getByRole('textbox', { name: /generated text/i });
    expect(output).toHaveValue('');
  });

  test('shows character and word count', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    
    expect(screen.getByText(/characters/i)).toBeInTheDocument();
    expect(screen.getByText(/words/i)).toBeInTheDocument();
  });

  test('supports different lorem ipsum variants', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const variantSelect = screen.getByLabelText(/variant/i);
    fireEvent.change(variantSelect, { target: { value: 'cicero' } });
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    
    const output = screen.getByRole('textbox', { name: /generated text/i });
    expect(output.value).toBeTruthy();
  });

  test('generates HTML formatted output', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const htmlCheckbox = screen.getByLabelText(/html format/i);
    const paragraphsTab = screen.getByText('Paragraphs');
    const generateButton = screen.getByText('Generate');
    
    fireEvent.click(paragraphsTab);
    fireEvent.click(htmlCheckbox);
    fireEvent.click(generateButton);
    
    const output = screen.getByRole('textbox', { name: /generated text/i });
    expect(output.value).toMatch(/<p>/);
    expect(output.value).toMatch(/<\/p>/);
  });

  test('handles negative input values', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    fireEvent.change(countInput, { target: { value: '-5' } });
    
    expect(countInput).toHaveValue(1); // Should default to minimum
  });

  test('preserves settings between generations', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const sentencesTab = screen.getByText('Sentences');
    const countInput = screen.getByLabelText(/count/i);
    const startWithLoremCheckbox = screen.getByLabelText(/start with.*lorem ipsum/i);
    
    fireEvent.click(sentencesTab);
    fireEvent.change(countInput, { target: { value: '5' } });
    fireEvent.click(startWithLoremCheckbox);
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    fireEvent.click(generateButton); // Generate again
    
    expect(countInput).toHaveValue(5);
    expect(startWithLoremCheckbox).toBeChecked();
  });

  test('shows generation history', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Recent Generations')).toBeInTheDocument();
  });

  test('allows custom word lists', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const customWordsCheckbox = screen.getByLabelText(/custom words/i);
    fireEvent.click(customWordsCheckbox);
    
    const customWordsInput = screen.getByPlaceholderText(/enter custom words/i);
    fireEvent.change(customWordsInput, { target: { value: 'apple, banana, cherry' } });
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    
    const output = screen.getByRole('textbox', { name: /generated text/i });
    expect(output.value).toMatch(/apple|banana|cherry/);
  });

  test('provides preset quick options', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    expect(screen.getByText('50 words')).toBeInTheDocument();
    expect(screen.getByText('100 words')).toBeInTheDocument();
    expect(screen.getByText('5 sentences')).toBeInTheDocument();
    expect(screen.getByText('3 paragraphs')).toBeInTheDocument();
  });

  test('uses preset quick options', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const preset50Words = screen.getByText('50 words');
    fireEvent.click(preset50Words);
    
    const countInput = screen.getByLabelText(/count/i);
    expect(countInput).toHaveValue(50);
    
    const wordsTab = screen.getByText('Words');
    expect(wordsTab).toHaveClass('active'); // Should switch to words mode
  });

  test('handles special characters in custom words', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const customWordsCheckbox = screen.getByLabelText(/custom words/i);
    fireEvent.click(customWordsCheckbox);
    
    const customWordsInput = screen.getByPlaceholderText(/enter custom words/i);
    fireEvent.change(customWordsInput, { target: { value: 'café, naïve, résumé' } });
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    
    const output = screen.getByRole('textbox', { name: /generated text/i });
    expect(output.value).toMatch(/café|naïve|résumé/);
  });

  test('shows lorem ipsum explanation', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    expect(screen.getByText(/what is lorem ipsum/i)).toBeInTheDocument();
    expect(screen.getByText(/placeholder text/i)).toBeInTheDocument();
  });

  test('generates consistent output for same parameters', () => {
    renderWithProviders(<LoremIpsumPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    const generateButton = screen.getByText('Generate');
    
    fireEvent.change(countInput, { target: { value: '10' } });
    fireEvent.click(generateButton);
    
    const output1 = screen.getByRole('textbox', { name: /generated text/i }).value;
    
    fireEvent.click(generateButton);
    const output2 = screen.getByRole('textbox', { name: /generated text/i }).value;
    
    // Should be different (random generation)
    expect(output1).not.toBe(output2);
  });
});