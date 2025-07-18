import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UUIDGeneratorPage from '../pages/UUIDGeneratorPage';

// Simple test wrapper
const renderWithProviders = (component: React.ReactElement) => {
  return render(component);
};

describe('UUID Generator', () => {
  it('renders UUID generator interface', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    expect(screen.getByText('UUID Generator')).toBeInTheDocument();
    expect(screen.getByText('v4 (Random)')).toBeInTheDocument();
    expect(screen.getByText('Generate UUIDs')).toBeInTheDocument();
  });

  it('generates UUIDs when button is clicked', () => {
    renderWithProviders(<UUIDGeneratorPage />);
    
    const generateButton = screen.getByText('Generate UUIDs');
    fireEvent.click(generateButton);
    
    // Should show generated UUIDs section
    expect(screen.getByText(/Generated UUIDs/i)).toBeInTheDocument();
  });
});