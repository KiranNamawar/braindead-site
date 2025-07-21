/**
 * Tests for keyboard navigation in the SearchBar component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';
import type { SearchSuggestion } from '~/lib/types';

// Mock suggestions for testing
const mockSuggestions: SearchSuggestion[] = [
  {
    type: 'utility',
    text: 'JSON Formatter',
    utility: {
      id: 'json-formatter',
      name: 'JSON Formatter',
      description: 'Format, validate, and minify JSON with syntax highlighting',
      category: 'developer',
      keywords: ['json', 'format', 'validate', 'minify', 'pretty', 'syntax'],
      route: '/tools/json-formatter',
      icon: 'Braces',
      featured: true
    }
  },
  {
    type: 'keyword',
    text: 'format'
  },
  {
    type: 'category',
    text: 'Developer Tools'
  }
];

describe('SearchBar Keyboard Navigation', () => {
  test('should navigate through suggestions with arrow keys', () => {
    const onSearch = jest.fn();
    const onSuggestionSelect = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        onSuggestionSelect={onSuggestionSelect}
        suggestions={mockSuggestions} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Initially no suggestion is selected
    const suggestions = screen.getAllByRole('option');
    expect(suggestions[0]).not.toHaveAttribute('aria-selected', 'true');
    
    // Press down arrow to select first suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(suggestions[0]).toHaveAttribute('aria-selected', 'true');
    
    // Press down arrow again to select second suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(suggestions[1]).toHaveAttribute('aria-selected', 'true');
    
    // Press down arrow again to select third suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(suggestions[2]).toHaveAttribute('aria-selected', 'true');
    
    // Press down arrow again to wrap around to first suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(suggestions[0]).toHaveAttribute('aria-selected', 'true');
    
    // Press up arrow to go to last suggestion
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(suggestions[2]).toHaveAttribute('aria-selected', 'true');
  });
  
  test('should select suggestion with Enter key', () => {
    const onSearch = jest.fn();
    const onSuggestionSelect = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        onSuggestionSelect={onSuggestionSelect}
        suggestions={mockSuggestions} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Press down arrow to select first suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // Press Enter to select it
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });
  
  test('should select suggestion with Tab key', () => {
    const onSearch = jest.fn();
    const onSuggestionSelect = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        onSuggestionSelect={onSuggestionSelect}
        suggestions={mockSuggestions} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Press down arrow to select first suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // Press Tab to select it
    fireEvent.keyDown(input, { key: 'Tab' });
    
    expect(onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });
  
  test('should close suggestions with Escape key', () => {
    const onSearch = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        suggestions={mockSuggestions} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Suggestions should be visible
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    // Press Escape to close suggestions
    fireEvent.keyDown(input, { key: 'Escape' });
    
    // Suggestions should be hidden
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  
  test('should jump to first suggestion with Home key', () => {
    const onSearch = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        suggestions={mockSuggestions} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Press down arrow twice to select second suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    const suggestions = screen.getAllByRole('option');
    expect(suggestions[1]).toHaveAttribute('aria-selected', 'true');
    
    // Press Ctrl+Home to jump to first suggestion
    fireEvent.keyDown(input, { key: 'Home', ctrlKey: true });
    
    expect(suggestions[0]).toHaveAttribute('aria-selected', 'true');
  });
  
  test('should jump to last suggestion with End key', () => {
    const onSearch = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        suggestions={mockSuggestions} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Press Ctrl+End to jump to last suggestion
    fireEvent.keyDown(input, { key: 'End', ctrlKey: true });
    
    const suggestions = screen.getAllByRole('option');
    expect(suggestions[2]).toHaveAttribute('aria-selected', 'true');
  });
  
  test('should perform search when Enter is pressed with no selection', () => {
    const onSearch = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        suggestions={mockSuggestions} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.focus(input);
    
    // Press Enter with no suggestion selected
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Should call onSearch with the current query
    expect(onSearch).toHaveBeenCalledWith('test query');
  });
});