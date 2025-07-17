import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BMICalculatorPage from '../pages/BMICalculatorPage';
import { ToastProvider } from '../components/ToastContainer';

// Mock the analytics utility
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

describe('BMICalculatorPage', () => {
  it('renders BMI calculator with all required elements', () => {
    renderWithProviders(<BMICalculatorPage />);
    
    // Check if main elements are present
    expect(screen.getByText('BMI Calculator')).toBeInTheDocument();
    expect(screen.getByText('Health metrics without the gym membership guilt.')).toBeInTheDocument();
    expect(screen.getByText('Unit System')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Height')).toBeInTheDocument();
    expect(screen.getByText('BMI Categories')).toBeInTheDocument();
  });

  it('switches between metric and imperial units', () => {
    renderWithProviders(<BMICalculatorPage />);
    
    const metricButton = screen.getByText('Metric (kg, cm)');
    const imperialButton = screen.getByText('Imperial (lbs, ft/in)');
    
    // Should start with metric selected
    expect(metricButton).toHaveClass('from-pink-500');
    
    // Switch to imperial
    fireEvent.click(imperialButton);
    expect(imperialButton).toHaveClass('from-pink-500');
    
    // Check that height inputs change
    expect(screen.getByText('ft')).toBeInTheDocument();
    expect(screen.getByText('in')).toBeInTheDocument();
  });

  it('calculates BMI correctly for metric units', () => {
    renderWithProviders(<BMICalculatorPage />);
    
    // Input weight and height in metric
    const weightInput = screen.getByPlaceholderText('70');
    const heightInput = screen.getByPlaceholderText('175');
    
    fireEvent.change(weightInput, { target: { value: '70' } });
    fireEvent.change(heightInput, { target: { value: '175' } });
    
    // BMI should be calculated (70 / (1.75^2) = 22.9)
    expect(screen.getByText('22.9')).toBeInTheDocument();
    expect(screen.getAllByText('Normal weight')).toHaveLength(2); // One in result, one in categories
  });

  it('calculates BMI correctly for imperial units', () => {
    renderWithProviders(<BMICalculatorPage />);
    
    // Switch to imperial
    const imperialButton = screen.getByText('Imperial (lbs, ft/in)');
    fireEvent.click(imperialButton);
    
    // Input weight and height in imperial
    const weightInput = screen.getByPlaceholderText('154');
    const feetInput = screen.getByPlaceholderText('5');
    const inchesInput = screen.getByPlaceholderText('9');
    
    fireEvent.change(weightInput, { target: { value: '154' } });
    fireEvent.change(feetInput, { target: { value: '5' } });
    fireEvent.change(inchesInput, { target: { value: '9' } });
    
    // Should calculate BMI and show result
    const bmiElements = screen.getAllByText(/22\.\d/);
    expect(bmiElements.length).toBeGreaterThan(0);
  });

  it('shows BMI categories with correct styling', () => {
    renderWithProviders(<BMICalculatorPage />);
    
    // Check that all BMI categories are displayed
    expect(screen.getByText('Underweight')).toBeInTheDocument();
    expect(screen.getByText('Normal weight')).toBeInTheDocument();
    expect(screen.getByText('Overweight')).toBeInTheDocument();
    expect(screen.getByText('Obese Class I')).toBeInTheDocument();
    expect(screen.getByText('Obese Class II')).toBeInTheDocument();
    expect(screen.getByText('Obese Class III')).toBeInTheDocument();
    
    // Check BMI ranges
    expect(screen.getByText('< 18.5')).toBeInTheDocument();
    expect(screen.getByText('18.5 - 24.9')).toBeInTheDocument();
    expect(screen.getByText('25.0 - 29.9')).toBeInTheDocument();
  });

  it('displays healthy weight range when BMI is calculated', () => {
    renderWithProviders(<BMICalculatorPage />);
    
    // Input values to trigger BMI calculation
    const weightInput = screen.getByPlaceholderText('70');
    const heightInput = screen.getByPlaceholderText('175');
    
    fireEvent.change(weightInput, { target: { value: '70' } });
    fireEvent.change(heightInput, { target: { value: '175' } });
    
    // Should show healthy weight range
    expect(screen.getByText('Healthy Weight Range')).toBeInTheDocument();
    expect(screen.getByText('BMI 18.5 - 24.9')).toBeInTheDocument();
  });

  it('handles invalid inputs gracefully', () => {
    renderWithProviders(<BMICalculatorPage />);
    
    // Input invalid values
    const weightInput = screen.getByPlaceholderText('70');
    const heightInput = screen.getByPlaceholderText('175');
    
    fireEvent.change(weightInput, { target: { value: '-10' } });
    fireEvent.change(heightInput, { target: { value: '0' } });
    
    // Should not show BMI results for invalid inputs
    expect(screen.queryByText('BMI Results')).not.toBeInTheDocument();
  });

  it('clears all inputs when clear button is clicked', () => {
    renderWithProviders(<BMICalculatorPage />);
    
    // Input some values
    const weightInput = screen.getByPlaceholderText('70');
    const heightInput = screen.getByPlaceholderText('175');
    
    fireEvent.change(weightInput, { target: { value: '70' } });
    fireEvent.change(heightInput, { target: { value: '175' } });
    
    // Click clear button
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    // Inputs should be cleared
    expect(weightInput).toHaveValue(null);
    expect(heightInput).toHaveValue(null);
  });
});