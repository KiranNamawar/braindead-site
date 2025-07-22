import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaseFormatSelector } from '../CaseFormatSelector';
import { CaseFormat, CASE_FORMATS } from '../types';

describe('CaseFormatSelector Component', () => {
  it('renders all case format options', () => {
    render(<CaseFormatSelector value={CaseFormat.TITLE} onChange={() => {}} />);
    
    const selector = screen.getByTestId('case-format-selector');
    expect(selector).toBeInTheDocument();
    
    // Check that all format options are rendered
    CASE_FORMATS.forEach(format => {
      const option = screen.getByTestId(`format-option-${format.id}`);
      expect(option).toBeInTheDocument();
      expect(screen.getByText(format.label)).toBeInTheDocument();
    });
  });

  it('marks the selected format as active', () => {
    const selectedFormat = CaseFormat.CAMEL;
    render(<CaseFormatSelector value={selectedFormat} onChange={() => {}} />);
    
    // Check that the selected format has the active attribute
    const activeOption = screen.getByTestId(`format-option-${selectedFormat}`);
    expect(activeOption).toHaveAttribute('data-active', 'true');
    
    // Check that other options are not active
    CASE_FORMATS
      .filter(format => format.id !== selectedFormat)
      .forEach(format => {
        const option = screen.getByTestId(`format-option-${format.id}`);
        expect(option).toHaveAttribute('data-active', 'false');
      });
  });

  it('calls onChange when a format is selected', () => {
    const handleChange = vi.fn();
    render(<CaseFormatSelector value={CaseFormat.TITLE} onChange={handleChange} />);
    
    // Click on a different format
    const newFormat = CaseFormat.SNAKE;
    const radioInput = screen.getByLabelText(
      CASE_FORMATS.find(format => format.id === newFormat)?.label || ''
    );
    
    fireEvent.click(radioInput);
    
    // Check that onChange was called with the correct format
    expect(handleChange).toHaveBeenCalledWith(newFormat);
  });

  it('has the correct structure for tooltips', () => {
    // Note: Testing tooltips is challenging in JSDOM environment
    // This test verifies the structure rather than the tooltip visibility
    render(<CaseFormatSelector value={CaseFormat.TITLE} onChange={() => {}} />);
    
    // Check that all format options are rendered with tooltip triggers
    CASE_FORMATS.forEach(format => {
      const label = screen.getByText(format.label);
      expect(label.closest('[data-slot="tooltip-trigger"]')).toBeInTheDocument();
    });
    
    // Verify the help text is present
    expect(screen.getByText(/Hover over a format for more information/)).toBeInTheDocument();
  });
});