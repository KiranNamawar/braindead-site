import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RomanNumeralPage from '../pages/RomanNumeralPage';

// Simple test wrapper
const renderWithProviders = (component: React.ReactElement) => {
  return render(component);
};

describe('Roman Numeral Converter', () => {
  it('renders roman numeral converter interface', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    expect(screen.getByText('Roman Numeral Converter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter number \(1-3999\)/i)).toBeInTheDocument();
    expect(screen.getByText('Decimal to Roman')).toBeInTheDocument();
  });

  it('converts decimal to roman numeral', () => {
    renderWithProviders(<RomanNumeralPage />);
    
    const numberInput = screen.getByPlaceholderText(/enter number \(1-3999\)/i);
    
    fireEvent.change(numberInput, { target: { value: '42' } });
    
    expect(screen.getByDisplayValue('XLII')).toBeInTheDocument();
  });
});