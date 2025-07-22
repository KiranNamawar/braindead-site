import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextOutput } from '../TextOutput';

// Mock the toast module
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TextOutput Component', () => {
  it('renders with empty value', () => {
    render(<TextOutput value="" />);
    
    const textarea = screen.getByTestId('output-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('');
    expect(textarea).toHaveAttribute('placeholder', 'Converted text will appear here...');
    
    // Buttons should be disabled
    expect(screen.getByTestId('copy-button')).toBeDisabled();
    expect(screen.getByTestId('download-button')).toBeDisabled();
    
    // Should show "No text to display" message
    expect(screen.getByText('No text to display')).toBeInTheDocument();
  });

  it('renders with provided value', () => {
    const testValue = 'Test Output Text';
    render(<TextOutput value={testValue} />);
    
    const textarea = screen.getByTestId('output-textarea');
    expect(textarea).toHaveValue(testValue);
    
    // Buttons should be enabled
    expect(screen.getByTestId('copy-button')).not.toBeDisabled();
    expect(screen.getByTestId('download-button')).not.toBeDisabled();
    
    // Should show character count
    expect(screen.getByText(`${testValue.length} characters`)).toBeInTheDocument();
  });
});