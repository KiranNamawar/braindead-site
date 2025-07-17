import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import DiffCheckerPage from '../pages/DiffCheckerPage';
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

describe('Diff Checker', () => {
  test('renders diff checker interface', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    expect(screen.getByText('Diff Checker')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/original text/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/modified text/i)).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
  });

  test('compares identical texts', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const compareButton = screen.getByText('Compare');
    
    const sameText = 'Hello World\nThis is a test';
    fireEvent.change(originalInput, { target: { value: sameText } });
    fireEvent.change(modifiedInput, { target: { value: sameText } });
    fireEvent.click(compareButton);
    
    expect(screen.getByText(/no differences found/i)).toBeInTheDocument();
  });

  test('detects line additions', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.change(originalInput, { target: { value: 'Line 1\nLine 2' } });
    fireEvent.change(modifiedInput, { target: { value: 'Line 1\nLine 2\nLine 3' } });
    fireEvent.click(compareButton);
    
    expect(screen.getByText(/1.*addition/i)).toBeInTheDocument();
  });

  test('detects line deletions', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.change(originalInput, { target: { value: 'Line 1\nLine 2\nLine 3' } });
    fireEvent.change(modifiedInput, { target: { value: 'Line 1\nLine 3' } });
    fireEvent.click(compareButton);
    
    expect(screen.getByText(/1.*deletion/i)).toBeInTheDocument();
  });

  test('detects line modifications', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.change(originalInput, { target: { value: 'Hello World' } });
    fireEvent.change(modifiedInput, { target: { value: 'Hello Universe' } });
    fireEvent.click(compareButton);
    
    expect(screen.getByText(/1.*modification/i)).toBeInTheDocument();
  });

  test('handles empty inputs', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const compareButton = screen.getByText('Compare');
    fireEvent.click(compareButton);
    
    expect(screen.getByText(/please enter text/i)).toBeInTheDocument();
  });

  test('switches between diff view modes', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.change(originalInput, { target: { value: 'Hello World' } });
    fireEvent.change(modifiedInput, { target: { value: 'Hello Universe' } });
    fireEvent.click(compareButton);
    
    // Switch to unified view
    const unifiedViewButton = screen.getByText('Unified View');
    fireEvent.click(unifiedViewButton);
    
    expect(screen.getByText('Unified View')).toBeInTheDocument();
  });

  test('ignores whitespace when option is selected', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const ignoreWhitespaceCheckbox = screen.getByLabelText(/ignore whitespace/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.click(ignoreWhitespaceCheckbox);
    fireEvent.change(originalInput, { target: { value: 'Hello World' } });
    fireEvent.change(modifiedInput, { target: { value: 'Hello  World   ' } });
    fireEvent.click(compareButton);
    
    expect(screen.getByText(/no differences found/i)).toBeInTheDocument();
  });

  test('ignores case when option is selected', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const ignoreCaseCheckbox = screen.getByLabelText(/ignore case/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.click(ignoreCaseCheckbox);
    fireEvent.change(originalInput, { target: { value: 'Hello World' } });
    fireEvent.change(modifiedInput, { target: { value: 'HELLO WORLD' } });
    fireEvent.click(compareButton);
    
    expect(screen.getByText(/no differences found/i)).toBeInTheDocument();
  });

  test('uploads files for comparison', async () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalFileInput = screen.getByLabelText(/upload original file/i);
    const modifiedFileInput = screen.getByLabelText(/upload modified file/i);
    
    const file1 = new File(['Hello World'], 'original.txt', { type: 'text/plain' });
    const file2 = new File(['Hello Universe'], 'modified.txt', { type: 'text/plain' });
    
    fireEvent.change(originalFileInput, { target: { files: [file1] } });
    fireEvent.change(modifiedFileInput, { target: { files: [file2] } });
    
    expect(originalFileInput.files[0]).toBe(file1);
    expect(modifiedFileInput.files[0]).toBe(file2);
  });

  test('exports diff results', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.change(originalInput, { target: { value: 'Hello World' } });
    fireEvent.change(modifiedInput, { target: { value: 'Hello Universe' } });
    fireEvent.click(compareButton);
    
    const exportButton = screen.getByText('Export Diff');
    fireEvent.click(exportButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('copies diff results to clipboard', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.change(originalInput, { target: { value: 'Hello World' } });
    fireEvent.change(modifiedInput, { target: { value: 'Hello Universe' } });
    fireEvent.click(compareButton);
    
    const copyButton = screen.getByText('Copy Diff');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('clears all inputs and results', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.change(originalInput, { target: { value: 'Hello World' } });
    fireEvent.change(modifiedInput, { target: { value: 'Hello Universe' } });
    fireEvent.click(compareButton);
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(originalInput).toHaveValue('');
    expect(modifiedInput).toHaveValue('');
  });

  test('shows line numbers in diff view', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.change(originalInput, { target: { value: 'Line 1\nLine 2\nLine 3' } });
    fireEvent.change(modifiedInput, { target: { value: 'Line 1\nModified Line 2\nLine 3' } });
    fireEvent.click(compareButton);
    
    expect(screen.getByText('1')).toBeInTheDocument(); // Line number
    expect(screen.getByText('2')).toBeInTheDocument(); // Line number
  });

  test('handles large text files', () => {
    renderWithProviders(<DiffCheckerPage />);
    
    const largeText1 = 'Line\n'.repeat(1000);
    const largeText2 = 'Line\n'.repeat(999) + 'Modified Line\n';
    
    const originalInput = screen.getByPlaceholderText(/original text/i);
    const modifiedInput = screen.getByPlaceholderText(/modified text/i);
    const compareButton = screen.getByText('Compare');
    
    fireEvent.change(originalInput, { target: { value: largeText1 } });
    fireEvent.change(modifiedInput, { target: { value: largeText2 } });
    fireEvent.click(compareButton);
    
    // Should handle large files without crashing
    expect(screen.getByText(/differences found/i)).toBeInTheDocument();
  });
});