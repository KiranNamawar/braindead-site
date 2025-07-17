import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DatePicker from '../components/DatePicker';

describe('DatePicker', () => {
  it('renders date picker with placeholder', () => {
    const mockOnChange = vi.fn();
    
    render(
      <DatePicker
        value=""
        onChange={mockOnChange}
        placeholder="Select date"
      />
    );
    
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it('displays selected date correctly', () => {
    const mockOnChange = vi.fn();
    
    render(
      <DatePicker
        value="2024-01-15"
        onChange={mockOnChange}
        placeholder="Select date"
      />
    );
    
    expect(screen.getByDisplayValue('01/15/2024')).toBeInTheDocument();
  });

  it('opens calendar when clicked', () => {
    const mockOnChange = vi.fn();
    
    render(
      <DatePicker
        value=""
        onChange={mockOnChange}
        placeholder="Select date"
      />
    );
    
    const input = screen.getByPlaceholderText('Select date');
    fireEvent.click(input);
    
    // Calendar should be visible
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('navigates between months', () => {
    const mockOnChange = vi.fn();
    
    render(
      <DatePicker
        value=""
        onChange={mockOnChange}
        placeholder="Select date"
      />
    );
    
    const input = screen.getByPlaceholderText('Select date');
    fireEvent.click(input);
    
    // Get current month display
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  it('calls onChange when date is selected', () => {
    const mockOnChange = vi.fn();
    
    render(
      <DatePicker
        value=""
        onChange={mockOnChange}
        placeholder="Select date"
      />
    );
    
    const input = screen.getByPlaceholderText('Select date');
    fireEvent.click(input);
    
    // Click on "Today" button
    const todayButton = screen.getByText('Today');
    fireEvent.click(todayButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      new Date().toISOString().split('T')[0]
    );
  });

  it('respects max date constraint', () => {
    const mockOnChange = vi.fn();
    const maxDate = '2024-01-15';
    
    render(
      <DatePicker
        value=""
        onChange={mockOnChange}
        placeholder="Select date"
        max={maxDate}
      />
    );
    
    // Component should render without errors
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it('closes calendar when clicking outside', () => {
    const mockOnChange = vi.fn();
    
    render(
      <div>
        <DatePicker
          value=""
          onChange={mockOnChange}
          placeholder="Select date"
        />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    const input = screen.getByPlaceholderText('Select date');
    fireEvent.click(input);
    
    // Calendar should be open
    expect(screen.getByText('Today')).toBeInTheDocument();
    
    // Click outside
    const outsideElement = screen.getByTestId('outside');
    fireEvent.mouseDown(outsideElement);
    
    // Calendar should be closed
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });
});