import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import UUIDGeneratorPage from '../pages/UUIDGeneratorPage';
import { ToastProvider } from '../components/ToastContainer';

// Mock analytics
vi.mock('../utils/analytics', () => ({
  trackToolUsage: vi.fn(),
}));

// Mock crypto.randomUUID for consistent testing
const mockRandomUUID = vi.fn(() => '123e4567-e89b-12d3-a456-426614174000');
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockRandomUUID,
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

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

describe('UUID Generator', () => {
  test('renders UUID generator interface', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    expect(screen.getByText('UUID Generator')).toBeInTheDocument();
    expect(screen.getByText('Version 4 (Random)')).toBeInTheDocument();
    expect(screen.getByText('Generate UUID')).toBeInTheDocument();
    expect(screen.getByText('Bulk Generate')).toBeInTheDocument();
  });

  test('generates UUID v4 by default', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const generateButton = screen.getByText('Generate UUID');
    fireEvent.click(generateButton);
    
    expect(screen.getByDisplayValue('123e4567-e89b-12d3-a456-426614174000')).toBeInTheDocument();
  });

  test('generates multiple UUIDs in bulk', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    const bulkGenerateButton = screen.getByText('Bulk Generate');
    
    fireEvent.change(countInput, { target: { value: '5' } });
    fireEvent.click(bulkGenerateButton);
    
    const uuidList = screen.getByRole('textbox', { name: /generated uuids/i });
    const uuids = uuidList.value.split('\n');
    expect(uuids).toHaveLength(5);
  });

  test('validates bulk count input', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    const bulkGenerateButton = screen.getByText('Bulk Generate');
    
    fireEvent.change(countInput, { target: { value: '0' } });
    fireEvent.click(bulkGenerateButton);
    
    expect(screen.getByText(/count must be greater than 0/i)).toBeInTheDocument();
  });

  test('limits maximum bulk count', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    fireEvent.change(countInput, { target: { value: '10000' } });
    
    expect(countInput).toHaveValue(1000); // Should cap at maximum
  });

  test('switches to UUID v1', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const v1Button = screen.getByText('Version 1 (Timestamp)');
    fireEvent.click(v1Button);
    
    const generateButton = screen.getByText('Generate UUID');
    fireEvent.click(generateButton);
    
    // UUID v1 should have specific format with timestamp
    const uuidInput = screen.getByDisplayValue(/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(uuidInput).toBeInTheDocument();
  });

  test('switches to UUID v5', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const v5Button = screen.getByText('Version 5 (SHA-1)');
    fireEvent.click(v5Button);
    
    const namespaceInput = screen.getByPlaceholderText(/namespace uuid/i);
    const nameInput = screen.getByPlaceholderText(/name/i);
    const generateButton = screen.getByText('Generate UUID');
    
    fireEvent.change(namespaceInput, { target: { value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' } });
    fireEvent.change(nameInput, { target: { value: 'example.com' } });
    fireEvent.click(generateButton);
    
    // UUID v5 should have version 5 in the format
    const uuidInput = screen.getByDisplayValue(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(uuidInput).toBeInTheDocument();
  });

  test('validates UUID format', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const validateInput = screen.getByPlaceholderText(/enter uuid to validate/i);
    const validateButton = screen.getByText('Validate UUID');
    
    fireEvent.change(validateInput, { target: { value: '123e4567-e89b-12d3-a456-426614174000' } });
    fireEvent.click(validateButton);
    
    expect(screen.getByText('✅ Valid UUID')).toBeInTheDocument();
    expect(screen.getByText('Version: 1')).toBeInTheDocument();
    expect(screen.getByText('Variant: RFC 4122')).toBeInTheDocument();
  });

  test('detects invalid UUID format', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const validateInput = screen.getByPlaceholderText(/enter uuid to validate/i);
    const validateButton = screen.getByText('Validate UUID');
    
    fireEvent.change(validateInput, { target: { value: 'invalid-uuid-format' } });
    fireEvent.click(validateButton);
    
    expect(screen.getByText('❌ Invalid UUID')).toBeInTheDocument();
    expect(screen.getByText(/not a valid uuid format/i)).toBeInTheDocument();
  });

  test('copies single UUID to clipboard', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const generateButton = screen.getByText('Generate UUID');
    fireEvent.click(generateButton);
    
    const copyButton = screen.getByText('Copy UUID');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
  });

  test('copies bulk UUIDs to clipboard', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    const bulkGenerateButton = screen.getByText('Bulk Generate');
    
    fireEvent.change(countInput, { target: { value: '3' } });
    fireEvent.click(bulkGenerateButton);
    
    const copyAllButton = screen.getByText('Copy All');
    fireEvent.click(copyAllButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('downloads UUIDs as file', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    const bulkGenerateButton = screen.getByText('Bulk Generate');
    
    fireEvent.change(countInput, { target: { value: '5' } });
    fireEvent.click(bulkGenerateButton);
    
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('clears generated UUIDs', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const generateButton = screen.getByText('Generate UUID');
    fireEvent.click(generateButton);
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    const uuidInput = screen.getByDisplayValue('');
    expect(uuidInput).toHaveValue('');
  });

  test('shows UUID format explanation', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    expect(screen.getByText('UUID Format')).toBeInTheDocument();
    expect(screen.getByText(/8-4-4-4-12/)).toBeInTheDocument();
    expect(screen.getByText(/hexadecimal digits/i)).toBeInTheDocument();
  });

  test('shows UUID version differences', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    expect(screen.getByText('UUID Versions')).toBeInTheDocument();
    expect(screen.getByText(/Version 1.*timestamp/i)).toBeInTheDocument();
    expect(screen.getByText(/Version 4.*random/i)).toBeInTheDocument();
    expect(screen.getByText(/Version 5.*SHA-1/i)).toBeInTheDocument();
  });

  test('handles uppercase/lowercase formatting', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const uppercaseToggle = screen.getByLabelText(/uppercase/i);
    const generateButton = screen.getByText('Generate UUID');
    
    fireEvent.click(uppercaseToggle);
    fireEvent.click(generateButton);
    
    const uuidInput = screen.getByDisplayValue(/^[0-9A-F-]+$/);
    expect(uuidInput).toBeInTheDocument();
  });

  test('handles hyphens toggle', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const hyphensToggle = screen.getByLabelText(/include hyphens/i);
    const generateButton = screen.getByText('Generate UUID');
    
    fireEvent.click(hyphensToggle); // Remove hyphens
    fireEvent.click(generateButton);
    
    const uuidInput = screen.getByDisplayValue(/^[0-9a-f]{32}$/i);
    expect(uuidInput).toBeInTheDocument();
  });

  test('handles braces formatting', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const bracesToggle = screen.getByLabelText(/include braces/i);
    const generateButton = screen.getByText('Generate UUID');
    
    fireEvent.click(bracesToggle);
    fireEvent.click(generateButton);
    
    const uuidInput = screen.getByDisplayValue(/^\{.*\}$/);
    expect(uuidInput).toBeInTheDocument();
  });

  test('shows generation history', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const generateButton = screen.getByText('Generate UUID');
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Generation History')).toBeInTheDocument();
    expect(screen.getByText('123e4567-e89b-12d3-a456-426614174000')).toBeInTheDocument();
  });

  test('clears generation history', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const generateButton = screen.getByText('Generate UUID');
    fireEvent.click(generateButton);
    
    const clearHistoryButton = screen.getByText('Clear History');
    fireEvent.click(clearHistoryButton);
    
    expect(screen.queryByText('123e4567-e89b-12d3-a456-426614174000')).not.toBeInTheDocument();
  });

  test('validates namespace UUID for v5', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const v5Button = screen.getByText('Version 5 (SHA-1)');
    fireEvent.click(v5Button);
    
    const namespaceInput = screen.getByPlaceholderText(/namespace uuid/i);
    const generateButton = screen.getByText('Generate UUID');
    
    fireEvent.change(namespaceInput, { target: { value: 'invalid-namespace' } });
    fireEvent.click(generateButton);
    
    expect(screen.getByText(/invalid namespace uuid/i)).toBeInTheDocument();
  });

  test('requires name input for v5', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const v5Button = screen.getByText('Version 5 (SHA-1)');
    fireEvent.click(v5Button);
    
    const namespaceInput = screen.getByPlaceholderText(/namespace uuid/i);
    const generateButton = screen.getByText('Generate UUID');
    
    fireEvent.change(namespaceInput, { target: { value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' } });
    fireEvent.click(generateButton);
    
    expect(screen.getByText(/please enter a name/i)).toBeInTheDocument();
  });

  test('provides predefined namespaces for v5', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const v5Button = screen.getByText('Version 5 (SHA-1)');
    fireEvent.click(v5Button);
    
    expect(screen.getByText('DNS Namespace')).toBeInTheDocument();
    expect(screen.getByText('URL Namespace')).toBeInTheDocument();
    expect(screen.getByText('OID Namespace')).toBeInTheDocument();
    expect(screen.getByText('X.500 Namespace')).toBeInTheDocument();
  });

  test('uses predefined namespace', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const v5Button = screen.getByText('Version 5 (SHA-1)');
    fireEvent.click(v5Button);
    
    const dnsNamespaceButton = screen.getByText('DNS Namespace');
    fireEvent.click(dnsNamespaceButton);
    
    const namespaceInput = screen.getByPlaceholderText(/namespace uuid/i);
    expect(namespaceInput).toHaveValue('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
  });

  test('shows UUID statistics', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    const bulkGenerateButton = screen.getByText('Bulk Generate');
    
    fireEvent.change(countInput, { target: { value: '100' } });
    fireEvent.click(bulkGenerateButton);
    
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Generated: 100')).toBeInTheDocument();
    expect(screen.getByText('Unique Count: 100')).toBeInTheDocument();
  });

  test('detects duplicate UUIDs in bulk generation', () => {
    // Mock to return same UUID twice
    mockRandomUUID.mockReturnValueOnce('123e4567-e89b-12d3-a456-426614174000');
    mockRandomUUID.mockReturnValueOnce('123e4567-e89b-12d3-a456-426614174000');
    
    renderWithProviders(<UUIDGeneratorPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    const bulkGenerateButton = screen.getByText('Bulk Generate');
    
    fireEvent.change(countInput, { target: { value: '2' } });
    fireEvent.click(bulkGenerateButton);
    
    expect(screen.getByText(/duplicate.*detected/i)).toBeInTheDocument();
  });

  test('handles different output formats', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const formatSelect = screen.getByLabelText(/output format/i);
    const generateButton = screen.getByText('Generate UUID');
    
    fireEvent.change(formatSelect, { target: { value: 'array' } });
    fireEvent.click(generateButton);
    
    expect(screen.getByDisplayValue(/^\[.*\]$/)).toBeInTheDocument();
  });

  test('exports UUIDs in different formats', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const countInput = screen.getByLabelText(/count/i);
    const bulkGenerateButton = screen.getByText('Bulk Generate');
    const formatSelect = screen.getByLabelText(/export format/i);
    
    fireEvent.change(countInput, { target: { value: '5' } });
    fireEvent.click(bulkGenerateButton);
    
    fireEvent.change(formatSelect, { target: { value: 'json' } });
    
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('shows UUID collision probability', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    expect(screen.getByText('Collision Probability')).toBeInTheDocument();
    expect(screen.getByText(/extremely low/i)).toBeInTheDocument();
    expect(screen.getByText(/2\^122/i)).toBeInTheDocument();
  });

  test('handles keyboard shortcuts', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    // Ctrl+G should generate UUID
    fireEvent.keyDown(document, { key: 'g', ctrlKey: true });
    
    expect(screen.getByDisplayValue('123e4567-e89b-12d3-a456-426614174000')).toBeInTheDocument();
  });

  test('persists settings in localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    renderWithProviders(<UUIDGeneratorPage />);
    
    const uppercaseToggle = screen.getByLabelText(/uppercase/i);
    fireEvent.click(uppercaseToggle);
    
    expect(setItemSpy).toHaveBeenCalledWith(
      expect.stringContaining('uuid'),
      expect.stringContaining('uppercase')
    );
  });

  test('restores settings from localStorage', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockReturnValue(JSON.stringify({ uppercase: true, hyphens: false }));
    
    renderWithProviders(<UUIDGeneratorPage />);
    
    const uppercaseToggle = screen.getByLabelText(/uppercase/i);
    const hyphensToggle = screen.getByLabelText(/include hyphens/i);
    
    expect(uppercaseToggle).toBeChecked();
    expect(hyphensToggle).not.toBeChecked();
  });
});