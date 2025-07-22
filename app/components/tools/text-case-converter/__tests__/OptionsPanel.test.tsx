import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OptionsPanel } from '../OptionsPanel';
import type { ConversionOptionsState } from '../types';

describe('OptionsPanel Component', () => {
  const defaultOptions: ConversionOptionsState = {
    preserveAcronyms: true,
    alwaysCapitalize: [],
    neverCapitalize: [],
  };

  it('renders with default options', () => {
    render(<OptionsPanel options={defaultOptions} onChange={() => {}} />);
    
    expect(screen.getByTestId('options-panel')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-options')).toBeInTheDocument();
  });

  it('toggles the collapsible content when clicked', () => {
    render(<OptionsPanel options={defaultOptions} onChange={() => {}} />);
    
    // Initially, the content should be collapsed
    const initialPanel = screen.getByTestId('options-panel');
    expect(initialPanel).toHaveAttribute('data-state', 'closed');
    
    // Click the toggle button
    fireEvent.click(screen.getByTestId('toggle-options'));
    
    // Now the panel should be open
    expect(screen.getByTestId('options-panel')).toHaveAttribute('data-state', 'open');
    
    // Click again to collapse
    fireEvent.click(screen.getByTestId('toggle-options'));
    
    // The panel should be closed again
    expect(screen.getByTestId('options-panel')).toHaveAttribute('data-state', 'closed');
  });

  it('toggles preserve acronyms option', () => {
    const handleChange = vi.fn();
    render(<OptionsPanel 
      options={defaultOptions} 
      onChange={handleChange} 
    />);
    
    // Open the panel
    fireEvent.click(screen.getByTestId('toggle-options'));
    
    // Toggle the switch
    fireEvent.click(screen.getByTestId('preserve-acronyms-switch'));
    
    // Check that onChange was called with updated options
    expect(handleChange).toHaveBeenCalledWith({
      ...defaultOptions,
      preserveAcronyms: false,
    });
  });

  it('adds words to always capitalize list', () => {
    const handleChange = vi.fn();
    render(<OptionsPanel 
      options={defaultOptions} 
      onChange={handleChange} 
    />);
    
    // Open the panel
    fireEvent.click(screen.getByTestId('toggle-options'));
    
    // Type a word
    fireEvent.change(screen.getByTestId('always-capitalize-input'), {
      target: { value: 'JavaScript' }
    });
    
    // Click add button
    fireEvent.click(screen.getByTestId('add-always-capitalize'));
    
    // Check that onChange was called with updated options
    expect(handleChange).toHaveBeenCalledWith({
      ...defaultOptions,
      alwaysCapitalize: ['JavaScript'],
    });
  });

  it('adds words to never capitalize list', () => {
    const handleChange = vi.fn();
    render(<OptionsPanel 
      options={defaultOptions} 
      onChange={handleChange} 
    />);
    
    // Open the panel
    fireEvent.click(screen.getByTestId('toggle-options'));
    
    // Type a word
    fireEvent.change(screen.getByTestId('never-capitalize-input'), {
      target: { value: 'iPhone' }
    });
    
    // Click add button
    fireEvent.click(screen.getByTestId('add-never-capitalize'));
    
    // Check that onChange was called with updated options
    expect(handleChange).toHaveBeenCalledWith({
      ...defaultOptions,
      neverCapitalize: ['iPhone'],
    });
  });

  it('removes words from always capitalize list', () => {
    const options = {
      ...defaultOptions,
      alwaysCapitalize: ['JavaScript', 'TypeScript'],
    };
    
    const handleChange = vi.fn();
    render(<OptionsPanel 
      options={options} 
      onChange={handleChange} 
    />);
    
    // Open the panel
    fireEvent.click(screen.getByTestId('toggle-options'));
    
    // Find the word tag and click its remove button
    const wordTag = screen.getByTestId('always-word-JavaScript');
    const removeButton = wordTag.querySelector('button');
    fireEvent.click(removeButton!);
    
    // Check that onChange was called with updated options
    expect(handleChange).toHaveBeenCalledWith({
      ...options,
      alwaysCapitalize: ['TypeScript'],
    });
  });

  it('removes words from never capitalize list', () => {
    const options = {
      ...defaultOptions,
      neverCapitalize: ['iPhone', 'iPad'],
    };
    
    const handleChange = vi.fn();
    render(<OptionsPanel 
      options={options} 
      onChange={handleChange} 
    />);
    
    // Open the panel
    fireEvent.click(screen.getByTestId('toggle-options'));
    
    // Find the word tag and click its remove button
    const wordTag = screen.getByTestId('never-word-iPhone');
    const removeButton = wordTag.querySelector('button');
    fireEvent.click(removeButton!);
    
    // Check that onChange was called with updated options
    expect(handleChange).toHaveBeenCalledWith({
      ...options,
      neverCapitalize: ['iPad'],
    });
  });

  it('adds words with Enter key', () => {
    const handleChange = vi.fn();
    render(<OptionsPanel 
      options={defaultOptions} 
      onChange={handleChange} 
    />);
    
    // Open the panel
    fireEvent.click(screen.getByTestId('toggle-options'));
    
    // Type a word and press Enter
    const input = screen.getByTestId('always-capitalize-input');
    fireEvent.change(input, { target: { value: 'JavaScript' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Check that onChange was called with updated options
    expect(handleChange).toHaveBeenCalledWith({
      ...defaultOptions,
      alwaysCapitalize: ['JavaScript'],
    });
  });

  it('does not add empty words', () => {
    const handleChange = vi.fn();
    render(<OptionsPanel 
      options={defaultOptions} 
      onChange={handleChange} 
    />);
    
    // Open the panel
    fireEvent.click(screen.getByTestId('toggle-options'));
    
    // Try to add an empty word
    fireEvent.change(screen.getByTestId('always-capitalize-input'), {
      target: { value: '   ' }
    });
    fireEvent.click(screen.getByTestId('add-always-capitalize'));
    
    // Check that onChange was not called
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not add duplicate words', () => {
    const options = {
      ...defaultOptions,
      alwaysCapitalize: ['JavaScript'],
    };
    
    const handleChange = vi.fn();
    render(<OptionsPanel 
      options={options} 
      onChange={handleChange} 
    />);
    
    // Open the panel
    fireEvent.click(screen.getByTestId('toggle-options'));
    
    // Try to add a duplicate word
    fireEvent.change(screen.getByTestId('always-capitalize-input'), {
      target: { value: 'JavaScript' }
    });
    fireEvent.click(screen.getByTestId('add-always-capitalize'));
    
    // Check that onChange was not called
    expect(handleChange).not.toHaveBeenCalled();
  });
});