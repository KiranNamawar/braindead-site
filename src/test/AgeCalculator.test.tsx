import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AgeCalculatorPage from '../pages/AgeCalculatorPage';
import { ToastProvider } from '../components/ToastContainer';

// Mock analytics
vi.mock('../utils/analytics', () => ({
  trackToolUsage: vi.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <HelmetProvider>
        <ToastProvider>
          {component}
        </ToastProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
};

describe('Age Calculator', () => {
  it('renders age calculator interface', () => {
    renderWithProviders(<AgeCalculatorPage />);
    
    expect(screen.getByText('Age Calculator')).toBeInTheDocument();
    expect(screen.getByText('Birth Date')).toBeInTheDocument();
    expect(screen.getByText('Calculate Age As Of')).toBeInTheDocument();
  });

  it('calculates age correctly', () => {
    renderWithProviders(<AgeCalculatorPage />);
    
    const birthDateInput = screen.getByDisplayValue('');
    const targetDateInput = screen.getAllByDisplayValue(new Date().toISOString().split('T')[0])[0];
    
    // Set birth date to 30 years ago
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    const birthDateString = thirtyYearsAgo.toISOString().split('T')[0];
    
    fireEvent.change(birthDateInput, { target: { value: birthDateString } });
    
    // Should show 30 years
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('handles leap year calculations', () => {
    renderWithProviders(<AgeCalculatorPage />);
    
    const birthDateInput = screen.getByDisplayValue('');
    
    // Set birth date to a leap year (2000-02-29)
    fireEvent.change(birthDateInput, { target: { value: '2000-02-29' } });
    
    // Should handle leap year date correctly
    expect(screen.getByText('Born in a leap year')).toBeInTheDocument();
  });

  it('shows time precision when enabled', () => {
    renderWithProviders(<AgeCalculatorPage />);
    
    const timeCheckbox = screen.getByLabelText('Include precise time (hours and minutes)');
    fireEvent.click(timeCheckbox);
    
    // Should show time inputs
    expect(screen.getAllByDisplayValue('12:00')).toHaveLength(1);
  });

  it('saves calculation to history', () => {
    renderWithProviders(<AgeCalculatorPage />);
    
    const birthDateInput = screen.getByDisplayValue('');
    const saveButton = screen.getByText('Save Calculation');
    
    // Set a birth date
    fireEvent.change(birthDateInput, { target: { value: '1990-01-01' } });
    
    // Save calculation
    fireEvent.click(saveButton);
    
    // Should show in history
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('compares ages when two calculations are selected', () => {
    renderWithProviders(<AgeCalculatorPage />);
    
    const compareButton = screen.getByText('Compare');
    fireEvent.click(compareButton);
    
    // Should show comparison mode
    expect(screen.getByText('Hide')).toBeInTheDocument();
  });

  it('displays age facts', () => {
    renderWithProviders(<AgeCalculatorPage />);
    
    const birthDateInput = screen.getByDisplayValue('');
    
    // Set birth date to show facts
    fireEvent.change(birthDateInput, { target: { value: '1990-01-01' } });
    
    // Should show age facts section
    expect(screen.getByText('🎂 Age Facts')).toBeInTheDocument();
  });

  it('handles timezone selection', () => {
    renderWithProviders(<AgeCalculatorPage />);
    
    const timezoneSelect = screen.getByDisplayValue('America/New_York');
    
    fireEvent.change(timezoneSelect, { target: { value: 'UTC' } });
    
    expect(timezoneSelect).toHaveValue('UTC');
  });
});