import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import ASCIIArtGeneratorPage from '../pages/ASCIIArtGeneratorPage';
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

describe('ASCII Art Generator', () => {
  test('renders ASCII art generator interface', () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    expect(screen.getByText('ASCII Art Generator')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter text to convert/i)).toBeInTheDocument();
    expect(screen.getByText('Generate ASCII Art')).toBeInTheDocument();
  });

  test('generates ASCII art from text input', async () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to convert/i);
    const generateButton = screen.getByText('Generate ASCII Art');
    
    fireEvent.change(textInput, { target: { value: 'TEST' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Generated ASCII Art')).toBeInTheDocument();
    });
  });

  test('handles empty input validation', () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    const generateButton = screen.getByText('Generate ASCII Art');
    fireEvent.click(generateButton);
    
    expect(screen.getByText(/please enter some text/i)).toBeInTheDocument();
  });

  test('changes font style', async () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    const fontSelect = screen.getByLabelText(/font style/i);
    fireEvent.change(fontSelect, { target: { value: 'block' } });
    
    expect(fontSelect).toHaveValue('block');
  });

  test('adjusts character width', () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    const widthSlider = screen.getByLabelText(/character width/i);
    fireEvent.change(widthSlider, { target: { value: '80' } });
    
    expect(widthSlider).toHaveValue('80');
  });

  test('copies ASCII art to clipboard', async () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to convert/i);
    const generateButton = screen.getByText('Generate ASCII Art');
    
    fireEvent.change(textInput, { target: { value: 'TEST' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const copyButton = screen.getByText('Copy ASCII Art');
      fireEvent.click(copyButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  test('downloads ASCII art as text file', async () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to convert/i);
    const generateButton = screen.getByText('Generate ASCII Art');
    
    fireEvent.change(textInput, { target: { value: 'TEST' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const downloadButton = screen.getByText('Download as .txt');
      fireEvent.click(downloadButton);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  test('handles special characters in input', async () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to convert/i);
    const generateButton = screen.getByText('Generate ASCII Art');
    
    fireEvent.change(textInput, { target: { value: 'Hello@123!' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Generated ASCII Art')).toBeInTheDocument();
    });
  });

  test('limits input length', () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to convert/i);
    const longText = 'a'.repeat(101); // Assuming 100 char limit
    
    fireEvent.change(textInput, { target: { value: longText } });
    
    expect(textInput.value.length).toBeLessThanOrEqual(100);
  });

  test('shows character count', () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to convert/i);
    fireEvent.change(textInput, { target: { value: 'Hello' } });
    
    expect(screen.getByText(/5.*characters/i)).toBeInTheDocument();
  });

  test('clears input and output', async () => {
    renderWithProviders(<ASCIIArtGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to convert/i);
    const generateButton = screen.getByText('Generate ASCII Art');
    
    fireEvent.change(textInput, { target: { value: 'TEST' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);
      expect(textInput).toHaveValue('');
    });
  });
});