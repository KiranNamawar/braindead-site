import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import TipCalculatorPage from '../pages/TipCalculatorPage';
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

describe('Tip Calculator', () => {
  test('renders tip calculator interface', () => {
    renderWithProviders(<TipCalculatorPage />);
    
    expect(screen.getByText('Tip Calculator')).toBeInTheDocument();
    expect(screen.getByText('Bill Amount')).toBeInTheDocument();
    expect(screen.getByText('Tip Percentage')).toBeInTheDocument();
    expect(screen.getByText('Split Between')).toBeInTheDocument();
  });

  test('calculates tip correctly', () => {
    renderWithProviders(<TipCalculatorPage />);
    
    const billInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(billInput, { target: { value: '100' } });
    
    // Should show calculated amounts
    expect(screen.getByText('$100.00')).toBeInTheDocument(); // Bill amount
    expect(screen.getByText('$18.00')).toBeInTheDocument(); // Tip amount (18%)
    expect(screen.getByText('$118.00')).toBeInTheDocument(); // Total amount
  });

  test('handles custom tip percentage', () => {
    renderWithProviders(<TipCalculatorPage />);
    
    const billInput = screen.getByPlaceholderText('0.00');
    const customTipInput = screen.getByPlaceholderText('0');
    
    fireEvent.change(billInput, { target: { value: '50' } });
    fireEvent.change(customTipInput, { target: { value: '25' } });
    
    // Should calculate with 25% tip
    expect(screen.getByText('$12.50')).toBeInTheDocument(); // Tip amount (25%)
    expect(screen.getByText('$62.50')).toBeInTheDocument(); // Total amount
  });

  test('handles bill splitting', () => {
    renderWithProviders(<TipCalculatorPage />);
    
    const billInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(billInput, { target: { value: '120' } });
    
    // Click the + button to increase split count
    const plusButton = screen.getAllByText('+')[0];
    fireEvent.click(plusButton);
    fireEvent.click(plusButton); // Split between 3 people
    
    // Should show per person amount
    expect(screen.getByText('$47.20')).toBeInTheDocument(); // Per person (141.60 / 3)
  });

  test('shows tip presets', () => {
    renderWithProviders(<TipCalculatorPage />);
    
    // Should show preset tip percentages
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('18%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('22%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  test('saves calculation to history', () => {
    renderWithProviders(<TipCalculatorPage />);
    
    const billInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(billInput, { target: { value: '75' } });
    
    const saveButton = screen.getByText('Save Calculation');
    fireEvent.click(saveButton);
    
    // Should show success message (mocked)
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  test('clears all inputs', () => {
    renderWithProviders(<TipCalculatorPage />);
    
    const billInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(billInput, { target: { value: '100' } });
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    // Should reset to default values
    expect(billInput).toHaveValue('');
  });

  test('shows tipping guide', () => {
    renderWithProviders(<TipCalculatorPage />);
    
    expect(screen.getByText('💡 Tipping Guide')).toBeInTheDocument();
    expect(screen.getByText(/Restaurants:/)).toBeInTheDocument();
    expect(screen.getByText(/Bars:/)).toBeInTheDocument();
    expect(screen.getByText(/Delivery:/)).toBeInTheDocument();
  });
});