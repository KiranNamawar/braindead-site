import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from '../components/ToastContainer';
import GradeCalculatorPage from '../pages/GradeCalculatorPage';

// Mock the analytics utility
vi.mock('../utils/analytics', () => ({
  trackToolUsage: vi.fn(),
}));

// Mock the logger utility
vi.mock('../utils/logger', () => ({
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
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

describe('Grade Calculator', () => {
  it('renders grade calculator interface', () => {
    renderWithProviders(<GradeCalculatorPage />);
    
    expect(screen.getByText('Grade Calculator')).toBeInTheDocument();
    expect(screen.getByText('Calculate weighted grades, GPA, and predict what you need to achieve your target grade.')).toBeInTheDocument();
  });

  it('displays calculation type options', () => {
    renderWithProviders(<GradeCalculatorPage />);
    
    expect(screen.getByText('Weighted Grade')).toBeInTheDocument();
    expect(screen.getByText('GPA Calculator')).toBeInTheDocument();
    expect(screen.getByText('Grade Prediction')).toBeInTheDocument();
  });

  it('shows default grade items', () => {
    renderWithProviders(<GradeCalculatorPage />);
    
    expect(screen.getByDisplayValue('Midterm Exam')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Final Exam')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Homework Average')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Participation')).toBeInTheDocument();
  });

  it('can add new grade items', () => {
    renderWithProviders(<GradeCalculatorPage />);
    
    const addButton = screen.getByText('Add Item');
    fireEvent.click(addButton);
    
    // Should have 5 grade items now (4 default + 1 new)
    const assignmentInputs = screen.getAllByDisplayValue(/Assignment/);
    expect(assignmentInputs.length).toBeGreaterThan(0);
  });

  it('calculates weighted grade', () => {
    renderWithProviders(<GradeCalculatorPage />);
    
    const calculateButton = screen.getByText('Calculate Grade');
    fireEvent.click(calculateButton);
    
    // Should show results section
    expect(screen.getByText('Grade Results')).toBeInTheDocument();
    expect(screen.getByText('Final Percentage')).toBeInTheDocument();
    expect(screen.getByText('Letter Grade')).toBeInTheDocument();
    expect(screen.getByText('GPA Points')).toBeInTheDocument();
  });

  it('shows grade scale information', () => {
    renderWithProviders(<GradeCalculatorPage />);
    
    expect(screen.getByText('Grade Scale')).toBeInTheDocument();
    expect(screen.getByText('A+')).toBeInTheDocument();
    expect(screen.getByText('97-100%')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
  });

  it('displays quick guide', () => {
    renderWithProviders(<GradeCalculatorPage />);
    
    expect(screen.getByText('Quick Guide')).toBeInTheDocument();
    expect(screen.getByText('Weighted Grade')).toBeInTheDocument();
    expect(screen.getByText('GPA Calculation')).toBeInTheDocument();
    expect(screen.getByText('Grade Prediction')).toBeInTheDocument();
  });

  it('shows pro tips', () => {
    renderWithProviders(<GradeCalculatorPage />);
    
    expect(screen.getByText('Pro Tips')).toBeInTheDocument();
    expect(screen.getByText(/Weight Distribution/)).toBeInTheDocument();
    expect(screen.getByText(/Grade Prediction/)).toBeInTheDocument();
  });
});