import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoanCalculatorPage from '../pages/LoanCalculatorPage';
import { ToastProvider } from '../components/ToastContainer';

// Mock the analytics utility
vi.mock('../utils/analytics', () => ({
  trackToolUsage: vi.fn(),
}));

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const renderLoanCalculator = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <LoanCalculatorPage />
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('Loan Calculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('renders loan calculator interface', () => {
    renderLoanCalculator();
    
    expect(screen.getByText('Loan Calculator')).toBeInTheDocument();
    expect(screen.getByText('See how broke you\'ll be for the next 30 years.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('250000')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('6.5')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('30')).toBeInTheDocument();
  });

  it('calculates loan payment correctly', async () => {
    renderLoanCalculator();
    
    const principalInput = screen.getByPlaceholderText('250000');
    const interestInput = screen.getByPlaceholderText('6.5');
    const termInput = screen.getByPlaceholderText('30');
    
    fireEvent.change(principalInput, { target: { value: '250000' } });
    fireEvent.change(interestInput, { target: { value: '6.5' } });
    fireEvent.change(termInput, { target: { value: '30' } });
    
    await waitFor(() => {
      // Check if monthly payment is calculated (approximately $1,580 for these values)
      expect(screen.getByText(/\$1,5\d\d\.\d\d/)).toBeInTheDocument();
    });
  });

  it('handles zero interest rate', async () => {
    renderLoanCalculator();
    
    const principalInput = screen.getByPlaceholderText('250000');
    const interestInput = screen.getByPlaceholderText('6.5');
    const termInput = screen.getByPlaceholderText('30');
    
    fireEvent.change(principalInput, { target: { value: '120000' } });
    fireEvent.change(interestInput, { target: { value: '0' } });
    fireEvent.change(termInput, { target: { value: '10' } });
    
    await waitFor(() => {
      // For 0% interest, monthly payment should be principal / (years * 12)
      // 120000 / (10 * 12) = 1000
      expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    });
  });

  it('shows amortization schedule when requested', async () => {
    renderLoanCalculator();
    
    const principalInput = screen.getByPlaceholderText('250000');
    const interestInput = screen.getByPlaceholderText('6.5');
    const termInput = screen.getByPlaceholderText('30');
    
    fireEvent.change(principalInput, { target: { value: '100000' } });
    fireEvent.change(interestInput, { target: { value: '5' } });
    fireEvent.change(termInput, { target: { value: '15' } });
    
    const showScheduleButton = screen.getByText('Show Schedule');
    fireEvent.click(showScheduleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Amortization Schedule')).toBeInTheDocument();
      expect(screen.getByText('Month')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Principal')).toBeInTheDocument();
      expect(screen.getByText('Interest')).toBeInTheDocument();
      expect(screen.getByText('Balance')).toBeInTheDocument();
    });
  });

  it('saves calculation to history', async () => {
    renderLoanCalculator();
    
    const principalInput = screen.getByPlaceholderText('250000');
    const interestInput = screen.getByPlaceholderText('6.5');
    const termInput = screen.getByPlaceholderText('30');
    
    fireEvent.change(principalInput, { target: { value: '200000' } });
    fireEvent.change(interestInput, { target: { value: '4.5' } });
    fireEvent.change(termInput, { target: { value: '30' } });
    
    const saveButton = screen.getByText('Save Calculation');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  it('clears all inputs when clear button is clicked', async () => {
    renderLoanCalculator();
    
    const principalInput = screen.getByPlaceholderText('250000') as HTMLInputElement;
    const interestInput = screen.getByPlaceholderText('6.5') as HTMLInputElement;
    const termInput = screen.getByPlaceholderText('30') as HTMLInputElement;
    
    fireEvent.change(principalInput, { target: { value: '200000' } });
    fireEvent.change(interestInput, { target: { value: '4.5' } });
    fireEvent.change(termInput, { target: { value: '30' } });
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(principalInput.value).toBe('');
      expect(interestInput.value).toBe('');
      expect(termInput.value).toBe('');
    });
  });

  it('copies payment amounts to clipboard', async () => {
    renderLoanCalculator();
    
    const principalInput = screen.getByPlaceholderText('250000');
    const interestInput = screen.getByPlaceholderText('6.5');
    const termInput = screen.getByPlaceholderText('30');
    
    fireEvent.change(principalInput, { target: { value: '100000' } });
    fireEvent.change(interestInput, { target: { value: '5' } });
    fireEvent.change(termInput, { target: { value: '15' } });
    
    const copyMonthlyButton = screen.getByText('Copy Monthly');
    fireEvent.click(copyMonthlyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it('validates input and disables save button for invalid data', () => {
    renderLoanCalculator();
    
    const saveButton = screen.getByText('Save Calculation');
    
    // Button should be disabled when no inputs are provided
    expect(saveButton).toBeDisabled();
    
    // Add only principal
    const principalInput = screen.getByPlaceholderText('250000');
    fireEvent.change(principalInput, { target: { value: '100000' } });
    
    // Button should still be disabled
    expect(saveButton).toBeDisabled();
  });
});