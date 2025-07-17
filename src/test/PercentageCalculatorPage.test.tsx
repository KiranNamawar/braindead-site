import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PercentageCalculatorPage from '../pages/PercentageCalculatorPage';
import { ToastProvider } from '../components/ToastContainer';

// Mock the analytics module
vi.mock('../utils/analytics', () => ({
  trackToolUsage: vi.fn(),
}));

// Mock the useLocalStorage hook
vi.mock('../hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn(() => [[], vi.fn()]),
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

describe('PercentageCalculatorPage', () => {
  it('renders the page correctly', () => {
    renderWithProviders(<PercentageCalculatorPage />);
    
    // Check for main heading
    expect(screen.getByText('Percentage Calculator')).toBeInTheDocument();
    
    // Check for description
    expect(screen.getByText(/Calculate percentages, increases, decreases, and changes with clear explanations/)).toBeInTheDocument();
    
    // Check for sarcastic tagline
    expect(screen.getByText(/Because mental math is overrated!/)).toBeInTheDocument();
    
    // Check for calculator component
    expect(screen.getByText('Calculation Type')).toBeInTheDocument();
    
    // Check for history section
    expect(screen.getByText('History')).toBeInTheDocument();
    
    // Check for quick guide
    expect(screen.getByText('Quick Guide')).toBeInTheDocument();
  });

  it('displays the correct SEO information', () => {
    renderWithProviders(<PercentageCalculatorPage />);
    
    // The SEOHead component should set the document title
    // We can't directly test the helmet changes in this test environment,
    // but we can verify the component renders without errors
    expect(screen.getByText('Percentage Calculator')).toBeInTheDocument();
  });

  it('shows empty history state initially', () => {
    renderWithProviders(<PercentageCalculatorPage />);
    
    expect(screen.getByText('No calculations yet.')).toBeInTheDocument();
    expect(screen.getByText('Start calculating to see history!')).toBeInTheDocument();
  });

  it('displays the quick guide with all calculation types', () => {
    renderWithProviders(<PercentageCalculatorPage />);
    
    // Check for the Quick Guide section specifically
    expect(screen.getByText('Quick Guide')).toBeInTheDocument();
    
    // Check for unique examples in the guide
    expect(screen.getByText('25% of 200 = 50')).toBeInTheDocument();
    expect(screen.getByText('100 → 120 = 20% increase')).toBeInTheDocument();
    expect(screen.getByText('100 → 80 = 20% decrease')).toBeInTheDocument();
    expect(screen.getByText('25 is 25% of 100')).toBeInTheDocument();
    expect(screen.getByText('Auto-detects increase/decrease')).toBeInTheDocument();
  });

  it('displays common uses section', () => {
    renderWithProviders(<PercentageCalculatorPage />);
    
    expect(screen.getByText('💡 Common Uses')).toBeInTheDocument();
    expect(screen.getByText(/Sales & Discounts/)).toBeInTheDocument();
    expect(screen.getByText(/Tips & Taxes/)).toBeInTheDocument();
    expect(screen.getByText(/Growth Analysis/)).toBeInTheDocument();
  });

  it('has back button for navigation', () => {
    renderWithProviders(<PercentageCalculatorPage />);
    
    // The BackButton component should be present
    // We can verify it exists by checking for navigation elements
    const backElements = screen.getAllByRole('button');
    expect(backElements.length).toBeGreaterThan(0);
  });

  it('displays feature highlights', () => {
    renderWithProviders(<PercentageCalculatorPage />);
    
    expect(screen.getByText('Multiple calculation types')).toBeInTheDocument();
    expect(screen.getByText('Clear explanations')).toBeInTheDocument();
    expect(screen.getByText('Formula breakdowns')).toBeInTheDocument();
  });
});