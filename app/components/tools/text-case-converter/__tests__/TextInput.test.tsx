import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TextInput } from '../TextInput';

describe('TextInput Component', () => {
  // Mock timer for debounce testing
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with initial value', () => {
    const initialValue = 'Initial text';
    render(<TextInput value={initialValue} onChange={() => {}} />);
    
    const textarea = screen.getByTestId('text-input');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(initialValue);
  });

  it('displays the correct placeholder text', () => {
    render(<TextInput value="" onChange={() => {}} />);
    
    const textarea = screen.getByTestId('text-input');
    expect(textarea).toHaveAttribute('placeholder', expect.stringContaining('Type or paste your text here'));
  });

  it('updates local value immediately when typing', () => {
    render(<TextInput value="" onChange={() => {}} />);
    
    const textarea = screen.getByTestId('text-input');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    
    expect(textarea).toHaveValue('New text');
  });

  it('debounces the onChange callback', () => {
    const handleChange = vi.fn();
    render(<TextInput value="" onChange={handleChange} debounceTime={500} />);
    
    const textarea = screen.getByTestId('text-input');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    
    // The callback should not be called immediately
    expect(handleChange).not.toHaveBeenCalled();
    
    // Fast-forward time by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // The callback should still not be called
    expect(handleChange).not.toHaveBeenCalled();
    
    // Fast-forward time to 500ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Now the callback should be called
    expect(handleChange).toHaveBeenCalledWith('New text');
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('updates when the value prop changes', () => {
    const { rerender } = render(<TextInput value="Initial" onChange={() => {}} />);
    
    const textarea = screen.getByTestId('text-input');
    expect(textarea).toHaveValue('Initial');
    
    // Update the value prop
    rerender(<TextInput value="Updated" onChange={() => {}} />);
    
    // The textarea should reflect the new value
    expect(textarea).toHaveValue('Updated');
  });

  it('handles multiple rapid changes correctly', () => {
    const handleChange = vi.fn();
    render(<TextInput value="" onChange={handleChange} debounceTime={500} />);
    
    const textarea = screen.getByTestId('text-input');
    
    // Type "Hello"
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    
    // Wait 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Type "Hello world"
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    
    // Wait 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Type "Hello world!"
    fireEvent.change(textarea, { target: { value: 'Hello world!' } });
    
    // The callback should not have been called yet
    expect(handleChange).not.toHaveBeenCalled();
    
    // Fast-forward time to 500ms after the last change
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Now the callback should be called with the final value
    expect(handleChange).toHaveBeenCalledWith('Hello world!');
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});