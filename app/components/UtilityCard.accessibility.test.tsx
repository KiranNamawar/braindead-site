import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UtilityCard } from './UtilityCard';
import type { UtilityDefinition } from '~/lib/types';

// Mock the remix Link component
jest.mock('@remix-run/react', () => ({
  Link: ({ to, children, className, prefetch, ...rest }: any) => (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  )
}));

// Mock utility for testing
const mockUtility: UtilityDefinition = {
  id: 'json-formatter',
  name: 'JSON Formatter',
  description: 'Format, validate, and minify JSON with syntax highlighting',
  category: 'developer',
  keywords: ['json', 'format', 'validate', 'minify', 'pretty', 'syntax'],
  route: '/tools/json-formatter',
  icon: 'Braces',
  featured: true
};

describe('UtilityCard Accessibility', () => {
  test('has proper focus indicators', () => {
    const handleClick = jest.fn();
    
    render(
      <UtilityCard 
        utility={mockUtility} 
        onClick={handleClick}
      />
    );
    
    // Find the card
    const card = screen.getByTestId('utility-card-json-formatter');
    
    // Check that it has focus-visible classes
    expect(card.className).toContain('focus-visible:ring-2');
    expect(card.className).toContain('focus-visible:outline-none');
  });
  
  test('has proper ARIA attributes', () => {
    render(<UtilityCard utility={mockUtility} />);
    
    // Should have proper aria-label
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Open JSON Formatter');
    
    // With onClick handler, should have role="button"
    const { rerender } = render(
      <UtilityCard 
        utility={mockUtility} 
        onClick={() => {}}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Open JSON Formatter');
  });
  
  test('favorite button has proper accessibility attributes', () => {
    render(
      <UtilityCard 
        utility={mockUtility} 
        onFavoriteToggle={() => {}}
      />
    );
    
    // Favorite button should have proper aria-label
    const favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton).toBeInTheDocument();
    
    // With isFavorite=true
    const { rerender } = render(
      <UtilityCard 
        utility={mockUtility} 
        isFavorite={true}
        onFavoriteToggle={() => {}}
      />
    );
    
    // Should now have different aria-label
    const unfavoriteButton = screen.getByLabelText('Remove from favorites');
    expect(unfavoriteButton).toBeInTheDocument();
  });
  
  test('has touch-friendly interaction targets', () => {
    render(
      <UtilityCard 
        utility={mockUtility} 
        onFavoriteToggle={() => {}}
      />
    );
    
    // Favorite button should have adequate size for touch
    const favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton.className).toContain('h-8 w-8');
    
    // Card itself should be large enough for touch
    const card = screen.getByTestId('utility-card-json-formatter');
    const cardRect = card.getBoundingClientRect();
    
    // This is a bit of a hack since jsdom doesn't actually render,
    // but we're checking that the card has some minimum size
    expect(cardRect.width).toBeGreaterThan(0);
    expect(cardRect.height).toBeGreaterThan(0);
  });
  
  test('supports keyboard navigation', () => {
    const handleClick = jest.fn();
    
    render(
      <UtilityCard 
        utility={mockUtility} 
        onClick={handleClick}
      />
    );
    
    // Find the card
    const card = screen.getByTestId('utility-card-json-formatter');
    
    // Card should be focusable
    expect(card).toHaveAttribute('tabIndex', '0');
    
    // Press Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
    
    // Press Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
  
  test('category badge has proper contrast', () => {
    render(<UtilityCard utility={mockUtility} />);
    
    // Find the badge
    const badge = screen.getByText('Developer');
    
    // Check that it has proper styling classes
    // Note: We can't actually test color contrast in jsdom,
    // but we can check that the appropriate classes are applied
    expect(badge.className).toContain('bg-green-50');
    expect(badge.className).toContain('text-green-700');
  });
});