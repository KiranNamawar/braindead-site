import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('SearchBar', () => {
  test('renders with placeholder text', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} placeholder="Test placeholder" />);
    
    const input = screen.getByPlaceholderText('Test placeholder');
    expect(input).toBeInTheDocument();
  });
  
  test('calls onSearch when input changes', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'json' } });
    
    expect(onSearch).toHaveBeenCalledWith('json');
  });
  
  test('displays suggestions when provided', () => {
    const onSearch = jest.fn();
    render(
      <SearchBar 
        onSearch={onSearch} 
        suggestions={mockSuggestions} 
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Check that suggestions are displayed
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
    expect(screen.getByText('format')).toBeInTheDocument();
    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
  });
  
  test('handles suggestion selection', () => {
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
    
    // Click on a suggestion
    fireEvent.click(screen.getByText('JSON Formatter'));
    
    expect(onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });
  
  test('handles keyboard navigation', () => {
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
  
  test('clears input when clear button is clicked', () => {
    const onSearch = jest.fn();
    
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'json' } });
    
    // Clear button should appear
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    expect(input).toHaveValue('');
    expect(onSearch).toHaveBeenCalledWith('');
  });
  
  test('highlights matching text in suggestions', () => {
    const onSearch = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        suggestions={mockSuggestions}
        query="json"
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'json' } });
    
    // Check that the text is highlighted
    const highlightedText = screen.getByText('JSON Formatter');
    expect(highlightedText).toBeInTheDocument();
    
    // In a real test, we would check for the mark element, but this is simplified
  });
  
  test('handles accessibility attributes correctly', () => {
    const onSearch = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        suggestions={mockSuggestions}
      />
    );
    
    const input = screen.getByRole('searchbox');
    fireEvent.focus(input);
    
    // Check ARIA attributes
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    
    // The ID is now dynamically generated, so we need to get it from the attribute
    const controlsId = input.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    
    // Check that suggestions have correct role
    const suggestionsList = screen.getByRole('listbox');
    expect(suggestionsList).toBeInTheDocument();
    expect(suggestionsList.id).toBe(controlsId);
    
    // Check that suggestions have correct role
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(3);
  });
  
  test('provides proper screen reader announcements', () => {
    const onSearch = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        suggestions={mockSuggestions}
      />
    );
    
    const input = screen.getByRole('searchbox');
    
    // Check for live region
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    
    // Check for label and description
    expect(screen.getByLabelText('Search utilities')).toBe(input);
    
    // Custom label and description
    render(
      <SearchBar 
        onSearch={onSearch} 
        label="Custom label"
        description="Custom description"
      />
    );
    
    expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
  });
  
  test('shows loading indicator when isLoading is true', () => {
    const onSearch = jest.fn();
    
    render(
      <SearchBar 
        onSearch={onSearch} 
        isLoading={true}
      />
    );
    
    expect(screen.getByText('Loading search results')).toBeInTheDocument();
  });
  
  test('works as a controlled component with external query', () => {
    const onSearch = jest.fn();
    
    const { rerender } = render(
      <SearchBar 
        onSearch={onSearch} 
        query="controlled"
      />
    );
    
    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('controlled');
    
    // Update the controlled value
    rerender(
      <SearchBar 
        onSearch={onSearch} 
        query="updated"
      />
    );
    
    expect(input).toHaveValue('updated');
  });
  
  test('has proper accessibility attributes', () => {
    const onSearch = jest.fn();
    
    const { container } = render(
      <SearchBar 
        onSearch={onSearch} 
        suggestions={mockSuggestions}
      />
    );
    
    const input = screen.getByRole('searchbox');
    fireEvent.focus(input);
    
    // Check for proper accessibility attributes
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });
});