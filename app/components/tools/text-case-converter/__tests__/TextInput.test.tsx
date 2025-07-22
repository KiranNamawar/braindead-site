import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextInput } from '../TextInput';

describe('TextInput Component', () => {
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

  it('updates local value and calls onChange immediately when typing', () => {
    const handleChange = vi.fn();
    render(<TextInput value="" onChange={handleChange} />);
    
    const textarea = screen.getByTestId('text-input');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    
    // The textarea value should update immediately
    expect(textarea).toHaveValue('New text');
    
    // The onChange callback should be called immediately
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

  it('handles multiple changes correctly', () => {
    const handleChange = vi.fn();
    render(<TextInput value="" onChange={handleChange} />);
    
    const textarea = screen.getByTestId('text-input');
    
    // Type "Hello"
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalledWith('Hello');
    
    // Type "Hello world"
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(handleChange).toHaveBeenCalledWith('Hello world');
    
    // Type "Hello world!"
    fireEvent.change(textarea, { target: { value: 'Hello world!' } });
    expect(handleChange).toHaveBeenCalledWith('Hello world!');
    
    // The callback should have been called once for each change
    expect(handleChange).toHaveBeenCalledTimes(3);
  });
});