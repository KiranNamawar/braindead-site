import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import Base64EncoderPage from '../pages/Base64EncoderPage';
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

describe('Base64 Encoder/Decoder', () => {
  test('renders base64 encoder interface', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    expect(screen.getByText('Base64 Encoder/Decoder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter text to encode/i)).toBeInTheDocument();
    expect(screen.getByText('Encode')).toBeInTheDocument();
    expect(screen.getByText('Decode')).toBeInTheDocument();
  });

  test('encodes text to base64', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'Hello World' } });
    fireEvent.click(encodeButton);
    
    expect(screen.getByDisplayValue('SGVsbG8gV29ybGQ=')).toBeInTheDocument();
  });

  test('decodes base64 to text', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const base64Input = screen.getByPlaceholderText(/enter base64 to decode/i);
    const decodeButton = screen.getByText('Decode');
    
    fireEvent.change(base64Input, { target: { value: 'SGVsbG8gV29ybGQ=' } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByDisplayValue('Hello World')).toBeInTheDocument();
  });

  test('handles invalid base64 input', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const base64Input = screen.getByPlaceholderText(/enter base64 to decode/i);
    const decodeButton = screen.getByText('Decode');
    
    fireEvent.change(base64Input, { target: { value: 'Invalid@Base64!' } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/invalid base64/i)).toBeInTheDocument();
  });

  test('handles empty input validation', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const encodeButton = screen.getByText('Encode');
    fireEvent.click(encodeButton);
    
    expect(screen.getByText(/please enter some text/i)).toBeInTheDocument();
  });

  test('supports URL-safe base64 encoding', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const urlSafeCheckbox = screen.getByLabelText(/url-safe/i);
    const textInput = screen.getByPlaceholderText(/enter text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.click(urlSafeCheckbox);
    fireEvent.change(textInput, { target: { value: 'Hello>World?' } });
    fireEvent.click(encodeButton);
    
    // URL-safe base64 should not contain + or / characters
    const result = screen.getByDisplayValue(/^[A-Za-z0-9_-]*=*$/);
    expect(result).toBeInTheDocument();
  });

  test('handles file upload for encoding', async () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const fileInput = screen.getByLabelText(/upload file/i);
    const file = new File(['Hello World'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('SGVsbG8gV29ybGQ=')).toBeInTheDocument();
    });
  });

  test('handles binary file upload', async () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const fileInput = screen.getByLabelText(/upload file/i);
    const binaryData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const file = new File([binaryData], 'test.bin', { type: 'application/octet-stream' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('SGVsbG8=')).toBeInTheDocument();
    });
  });

  test('copies encoded result to clipboard', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'Hello' } });
    fireEvent.click(encodeButton);
    
    const copyButton = screen.getByText('Copy Encoded');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('SGVsbG8=');
  });

  test('downloads encoded result as file', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'Hello' } });
    fireEvent.click(encodeButton);
    
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('clears all inputs and outputs', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'Hello' } });
    fireEvent.click(encodeButton);
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(textInput).toHaveValue('');
  });

  test('handles large text input', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const largeText = 'A'.repeat(10000);
    const textInput = screen.getByPlaceholderText(/enter text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: largeText } });
    fireEvent.click(encodeButton);
    
    // Should handle large input without crashing
    expect(screen.getByDisplayValue(/^[A-Za-z0-9+/]*=*$/)).toBeInTheDocument();
  });

  test('shows input/output character counts', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to encode/i);
    fireEvent.change(textInput, { target: { value: 'Hello' } });
    
    expect(screen.getByText(/5.*characters/i)).toBeInTheDocument();
  });

  test('handles unicode characters', () => {
    renderWithProviders(<Base64EncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: '🚀 Hello 世界' } });
    fireEvent.click(encodeButton);
    
    // Should encode unicode properly
    expect(screen.getByDisplayValue(/^[A-Za-z0-9+/]*=*$/)).toBeInTheDocument();
  });
});