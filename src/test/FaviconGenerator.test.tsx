import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import FaviconGeneratorPage from '../pages/FaviconGeneratorPage';
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

describe('Favicon Generator', () => {
  test('renders favicon generator interface', () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    expect(screen.getByText('Favicon Generator')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter text or emoji/i)).toBeInTheDocument();
    expect(screen.getByText('Generate Favicon')).toBeInTheDocument();
  });

  test('generates favicon from text input', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    const generateButton = screen.getByText('Generate Favicon');
    
    fireEvent.change(textInput, { target: { value: 'A' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  test('generates favicon from emoji input', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    const generateButton = screen.getByText('Generate Favicon');
    
    fireEvent.change(textInput, { target: { value: '🚀' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  test('handles empty input validation', () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const generateButton = screen.getByText('Generate Favicon');
    fireEvent.click(generateButton);
    
    expect(screen.getByText(/please enter text or emoji/i)).toBeInTheDocument();
  });

  test('changes background color', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const colorInput = screen.getByLabelText(/background color/i);
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    
    expect(colorInput).toHaveValue('#ff0000');
  });

  test('changes text color', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textColorInput = screen.getByLabelText(/text color/i);
    fireEvent.change(textColorInput, { target: { value: '#ffffff' } });
    
    expect(textColorInput).toHaveValue('#ffffff');
  });

  test('adjusts font size', () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const fontSizeSlider = screen.getByLabelText(/font size/i);
    fireEvent.change(fontSizeSlider, { target: { value: '24' } });
    
    expect(fontSizeSlider).toHaveValue('24');
  });

  test('selects different favicon sizes', () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const size32Checkbox = screen.getByLabelText(/32x32/i);
    const size64Checkbox = screen.getByLabelText(/64x64/i);
    
    fireEvent.click(size32Checkbox);
    fireEvent.click(size64Checkbox);
    
    expect(size32Checkbox).toBeChecked();
    expect(size64Checkbox).toBeChecked();
  });

  test('downloads favicon as ICO file', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    const generateButton = screen.getByText('Generate Favicon');
    
    fireEvent.change(textInput, { target: { value: 'F' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const downloadButton = screen.getByText('Download ICO');
      fireEvent.click(downloadButton);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  test('downloads favicon as PNG file', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    const generateButton = screen.getByText('Generate Favicon');
    
    fireEvent.change(textInput, { target: { value: 'F' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const downloadButton = screen.getByText('Download PNG');
      fireEvent.click(downloadButton);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  test('downloads all sizes as ZIP', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    const generateButton = screen.getByText('Generate Favicon');
    
    fireEvent.change(textInput, { target: { value: 'F' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const downloadAllButton = screen.getByText('Download All Sizes');
      fireEvent.click(downloadAllButton);
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  test('shows favicon preview in different sizes', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    const generateButton = screen.getByText('Generate Favicon');
    
    fireEvent.change(textInput, { target: { value: 'T' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('16x16')).toBeInTheDocument();
      expect(screen.getByText('32x32')).toBeInTheDocument();
      expect(screen.getByText('48x48')).toBeInTheDocument();
    });
  });

  test('handles long text input by truncating', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    const generateButton = screen.getByText('Generate Favicon');
    
    fireEvent.change(textInput, { target: { value: 'VeryLongText' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  test('provides HTML code snippet for favicon', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    const generateButton = screen.getByText('Generate Favicon');
    
    fireEvent.change(textInput, { target: { value: 'W' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('HTML Code')).toBeInTheDocument();
      expect(screen.getByText(/link rel="icon"/i)).toBeInTheDocument();
    });
  });

  test('copies HTML code to clipboard', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    const generateButton = screen.getByText('Generate Favicon');
    
    fireEvent.change(textInput, { target: { value: 'C' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const copyButton = screen.getByText('Copy HTML');
      fireEvent.click(copyButton);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  test('clears all inputs and preview', () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    fireEvent.change(textInput, { target: { value: 'Test' } });
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(textInput).toHaveValue('');
  });

  test('handles special characters in text', async () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or emoji/i);
    const generateButton = screen.getByText('Generate Favicon');
    
    fireEvent.change(textInput, { target: { value: '@#$%' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  test('shows favicon usage tips', () => {
    renderWithProviders(<FaviconGeneratorPage />);
    
    expect(screen.getByText(/💡.*tips/i)).toBeInTheDocument();
    expect(screen.getByText(/16x16.*minimum/i)).toBeInTheDocument();
  });
});