import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import URLEncoderPage from '../pages/URLEncoderPage';
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

describe('URL Encoder/Decoder', () => {
  test('renders URL encoder interface', () => {
    renderWithProviders(<URLEncoderPage />);
    
    expect(screen.getByText('URL Encoder/Decoder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter url or text to encode/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter encoded url to decode/i)).toBeInTheDocument();
    expect(screen.getByText('Encode')).toBeInTheDocument();
    expect(screen.getByText('Decode')).toBeInTheDocument();
  });

  test('encodes URL with special characters', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter url or text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'hello world & test' } });
    fireEvent.click(encodeButton);
    
    expect(screen.getByDisplayValue('hello%20world%20%26%20test')).toBeInTheDocument();
  });

  test('decodes URL encoded text', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const encodedInput = screen.getByPlaceholderText(/enter encoded url to decode/i);
    const decodeButton = screen.getByText('Decode');
    
    fireEvent.change(encodedInput, { target: { value: 'hello%20world%20%26%20test' } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByDisplayValue('hello world & test')).toBeInTheDocument();
  });

  test('handles complete URL encoding', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter url or text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'https://example.com/search?q=hello world&type=test' } });
    fireEvent.click(encodeButton);
    
    expect(screen.getByDisplayValue(/https%3A%2F%2Fexample\.com/)).toBeInTheDocument();
  });

  test('handles query parameter encoding', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter url or text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'name=John Doe&email=john@example.com' } });
    fireEvent.click(encodeButton);
    
    expect(screen.getByDisplayValue('name%3DJohn%20Doe%26email%3Djohn%40example.com')).toBeInTheDocument();
  });

  test('handles component-wise URL encoding', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const componentModeButton = screen.getByText('Component Mode');
    fireEvent.click(componentModeButton);
    
    const textInput = screen.getByPlaceholderText(/enter url component/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(encodeButton);
    
    expect(screen.getByDisplayValue('hello%20world')).toBeInTheDocument();
  });

  test('handles empty input validation', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const encodeButton = screen.getByText('Encode');
    const decodeButton = screen.getByText('Decode');
    
    fireEvent.click(encodeButton);
    expect(screen.getByText(/please enter text to encode/i)).toBeInTheDocument();
    
    fireEvent.click(decodeButton);
    expect(screen.getByText(/please enter text to decode/i)).toBeInTheDocument();
  });

  test('handles invalid URL decoding', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const encodedInput = screen.getByPlaceholderText(/enter encoded url to decode/i);
    const decodeButton = screen.getByText('Decode');
    
    fireEvent.change(encodedInput, { target: { value: 'invalid%ZZ%encoding' } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/invalid url encoding/i)).toBeInTheDocument();
  });

  test('handles unicode characters', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter url or text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'café naïve 🚀' } });
    fireEvent.click(encodeButton);
    
    expect(screen.getByDisplayValue(/caf%C3%A9/)).toBeInTheDocument();
  });

  test('parses URL components', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const urlInput = screen.getByPlaceholderText(/enter complete url to parse/i);
    const parseButton = screen.getByText('Parse URL');
    
    fireEvent.change(urlInput, { target: { value: 'https://example.com:8080/path/to/page?param1=value1&param2=value2#section' } });
    fireEvent.click(parseButton);
    
    expect(screen.getByText('Protocol: https')).toBeInTheDocument();
    expect(screen.getByText('Host: example.com')).toBeInTheDocument();
    expect(screen.getByText('Port: 8080')).toBeInTheDocument();
    expect(screen.getByText('Path: /path/to/page')).toBeInTheDocument();
    expect(screen.getByText('Fragment: section')).toBeInTheDocument();
  });

  test('displays query parameters table', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const urlInput = screen.getByPlaceholderText(/enter complete url to parse/i);
    const parseButton = screen.getByText('Parse URL');
    
    fireEvent.change(urlInput, { target: { value: 'https://example.com?name=John&age=30&city=New York' } });
    fireEvent.click(parseButton);
    
    expect(screen.getByText('Query Parameters')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  test('validates URL format', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const urlInput = screen.getByPlaceholderText(/enter complete url to parse/i);
    const parseButton = screen.getByText('Parse URL');
    
    fireEvent.change(urlInput, { target: { value: 'not-a-valid-url' } });
    fireEvent.click(parseButton);
    
    expect(screen.getByText(/invalid url format/i)).toBeInTheDocument();
  });

  test('copies encoded result to clipboard', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter url or text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(encodeButton);
    
    const copyButton = screen.getByText('Copy Encoded');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello%20world');
  });

  test('copies decoded result to clipboard', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const encodedInput = screen.getByPlaceholderText(/enter encoded url to decode/i);
    const decodeButton = screen.getByText('Decode');
    
    fireEvent.change(encodedInput, { target: { value: 'hello%20world' } });
    fireEvent.click(decodeButton);
    
    const copyButton = screen.getByText('Copy Decoded');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello world');
  });

  test('clears all inputs and outputs', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter url or text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(encodeButton);
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(textInput).toHaveValue('');
    expect(screen.getByPlaceholderText(/enter encoded url to decode/i)).toHaveValue('');
  });

  test('handles batch URL encoding', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const batchInput = screen.getByPlaceholderText(/enter multiple urls/i);
    const batchEncodeButton = screen.getByText('Batch Encode');
    
    fireEvent.change(batchInput, { target: { value: 'hello world\ntest & example\nspecial chars!' } });
    fireEvent.click(batchEncodeButton);
    
    expect(screen.getByText('hello%20world')).toBeInTheDocument();
    expect(screen.getByText('test%20%26%20example')).toBeInTheDocument();
    expect(screen.getByText('special%20chars%21')).toBeInTheDocument();
  });

  test('downloads batch results', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const batchInput = screen.getByPlaceholderText(/enter multiple urls/i);
    const batchEncodeButton = screen.getByText('Batch Encode');
    
    fireEvent.change(batchInput, { target: { value: 'hello world\ntest example' } });
    fireEvent.click(batchEncodeButton);
    
    const downloadButton = screen.getByText('Download Results');
    fireEvent.click(downloadButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('shows encoding/decoding examples', () => {
    renderWithProviders(<URLEncoderPage />);
    
    expect(screen.getByText('Common Examples')).toBeInTheDocument();
    expect(screen.getByText('Space → %20')).toBeInTheDocument();
    expect(screen.getByText('& → %26')).toBeInTheDocument();
    expect(screen.getByText('@ → %40')).toBeInTheDocument();
  });

  test('handles form data encoding', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const formDataButton = screen.getByText('Form Data');
    fireEvent.click(formDataButton);
    
    const keyInput = screen.getByPlaceholderText(/parameter name/i);
    const valueInput = screen.getByPlaceholderText(/parameter value/i);
    const addButton = screen.getByText('Add Parameter');
    
    fireEvent.change(keyInput, { target: { value: 'name' } });
    fireEvent.change(valueInput, { target: { value: 'John Doe' } });
    fireEvent.click(addButton);
    
    expect(screen.getByText('name=John%20Doe')).toBeInTheDocument();
  });

  test('removes form data parameters', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const formDataButton = screen.getByText('Form Data');
    fireEvent.click(formDataButton);
    
    const keyInput = screen.getByPlaceholderText(/parameter name/i);
    const valueInput = screen.getByPlaceholderText(/parameter value/i);
    const addButton = screen.getByText('Add Parameter');
    
    fireEvent.change(keyInput, { target: { value: 'name' } });
    fireEvent.change(valueInput, { target: { value: 'John' } });
    fireEvent.click(addButton);
    
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);
    
    expect(screen.queryByText('name=John')).not.toBeInTheDocument();
  });

  test('handles URL building', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const urlBuilderButton = screen.getByText('URL Builder');
    fireEvent.click(urlBuilderButton);
    
    const baseUrlInput = screen.getByPlaceholderText(/base url/i);
    const pathInput = screen.getByPlaceholderText(/path/i);
    
    fireEvent.change(baseUrlInput, { target: { value: 'https://api.example.com' } });
    fireEvent.change(pathInput, { target: { value: '/users/search' } });
    
    const buildButton = screen.getByText('Build URL');
    fireEvent.click(buildButton);
    
    expect(screen.getByDisplayValue('https://api.example.com/users/search')).toBeInTheDocument();
  });

  test('shows character count for inputs', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter url or text to encode/i);
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    
    expect(screen.getByText(/11.*characters/i)).toBeInTheDocument();
  });

  test('handles very long URLs', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const longUrl = 'https://example.com/very/long/path/' + 'segment/'.repeat(100) + '?param=' + 'value'.repeat(100);
    const textInput = screen.getByPlaceholderText(/enter url or text to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: longUrl } });
    fireEvent.click(encodeButton);
    
    expect(screen.getByDisplayValue(/https%3A%2F%2Fexample\.com/)).toBeInTheDocument();
  });

  test('provides keyboard shortcuts', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter url or text to encode/i);
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    
    // Enter key should trigger encoding
    fireEvent.keyDown(textInput, { key: 'Enter' });
    
    expect(screen.getByDisplayValue('hello%20world')).toBeInTheDocument();
  });

  test('shows URL encoding reference', () => {
    renderWithProviders(<URLEncoderPage />);
    
    expect(screen.getByText('Encoding Reference')).toBeInTheDocument();
    expect(screen.getByText('Reserved Characters')).toBeInTheDocument();
    expect(screen.getByText('Unsafe Characters')).toBeInTheDocument();
  });

  test('handles malformed encoded URLs gracefully', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const encodedInput = screen.getByPlaceholderText(/enter encoded url to decode/i);
    const decodeButton = screen.getByText('Decode');
    
    fireEvent.change(encodedInput, { target: { value: 'hello%2world%' } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/malformed url encoding/i)).toBeInTheDocument();
  });

  test('preserves plus signs in form encoding', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const formEncodingButton = screen.getByText('Form Encoding');
    fireEvent.click(formEncodingButton);
    
    const textInput = screen.getByPlaceholderText(/enter text for form encoding/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(encodeButton);
    
    expect(screen.getByDisplayValue('hello+world')).toBeInTheDocument();
  });

  test('decodes plus signs in form encoding', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const formEncodingButton = screen.getByText('Form Encoding');
    fireEvent.click(formEncodingButton);
    
    const encodedInput = screen.getByPlaceholderText(/enter form encoded text/i);
    const decodeButton = screen.getByText('Decode');
    
    fireEvent.change(encodedInput, { target: { value: 'hello+world' } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByDisplayValue('hello world')).toBeInTheDocument();
  });
});