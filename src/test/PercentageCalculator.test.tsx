import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PercentageCalculator from '../tools/everyday-life/PercentageCalculator';

describe('PercentageCalculator', () => {
  const mockOnCalculate = vi.fn();

  beforeEach(() => {
    mockOnCalculate.mockClear();
  });

  it('renders correctly with default state', () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    expect(screen.getByText('Calculation Type')).toBeInTheDocument();
    expect(screen.getByText('Basic Percentage')).toBeInTheDocument();
    expect(screen.getByText('Calculate X% of a number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate percentage/i })).toBeDisabled();
  });

  it('enables calculate button when both inputs are filled', async () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    const numberInput = screen.getByPlaceholderText(/enter number/i);
    const percentageInput = screen.getByPlaceholderText(/enter percentage/i);
    const calculateButton = screen.getByRole('button', { name: /calculate percentage/i });
    
    fireEvent.change(numberInput, { target: { value: '100' } });
    fireEvent.change(percentageInput, { target: { value: '25' } });
    
    await waitFor(() => {
      expect(calculateButton).not.toBeDisabled();
    });
  });

  it('calculates basic percentage correctly', async () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    const numberInput = screen.getByPlaceholderText(/enter number/i);
    const percentageInput = screen.getByPlaceholderText(/enter percentage/i);
    const calculateButton = screen.getByRole('button', { name: /calculate percentage/i });
    
    fireEvent.change(numberInput, { target: { value: '100' } });
    fireEvent.change(percentageInput, { target: { value: '25' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('25.00')).toBeInTheDocument();
      expect(screen.getByText('25% of 100 is 25')).toBeInTheDocument();
      expect(screen.getByText('(100 × 25) ÷ 100 = 25')).toBeInTheDocument();
    });
    
    expect(mockOnCalculate).toHaveBeenCalledWith({
      type: 'basic',
      value1: 100,
      value2: 25,
      result: 25,
      explanation: '25% of 100 is 25',
      formula: '(100 × 25) ÷ 100 = 25'
    });
  });

  it('switches calculation types correctly', async () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    // Switch to percentage increase
    const increaseButton = screen.getByText('Increase');
    fireEvent.click(increaseButton);
    
    await waitFor(() => {
      expect(screen.getByText('Percentage Increase')).toBeInTheDocument();
      expect(screen.getByText('Calculate percentage increase from old to new value')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter original value/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter new value/i)).toBeInTheDocument();
    });
  });

  it('calculates percentage increase correctly', async () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    // Switch to percentage increase
    const increaseButton = screen.getByText('Increase');
    fireEvent.click(increaseButton);
    
    const originalInput = screen.getByPlaceholderText(/enter original value/i);
    const newInput = screen.getByPlaceholderText(/enter new value/i);
    const calculateButton = screen.getByRole('button', { name: /calculate percentage/i });
    
    fireEvent.change(originalInput, { target: { value: '100' } });
    fireEvent.change(newInput, { target: { value: '120' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('20.00%')).toBeInTheDocument();
      expect(screen.getByText('100 increased to 120 is a 20.00% increase')).toBeInTheDocument();
    });
    
    expect(mockOnCalculate).toHaveBeenCalledWith({
      type: 'increase',
      value1: 100,
      value2: 120,
      result: 20,
      explanation: '100 increased to 120 is a 20.00% increase',
      formula: '((120 - 100) ÷ 100) × 100 = 20.00%'
    });
  });

  it('calculates percentage decrease correctly', async () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    // Switch to percentage decrease
    const decreaseButton = screen.getByText('Decrease');
    fireEvent.click(decreaseButton);
    
    const originalInput = screen.getByPlaceholderText(/enter original value/i);
    const newInput = screen.getByPlaceholderText(/enter new value/i);
    const calculateButton = screen.getByRole('button', { name: /calculate percentage/i });
    
    fireEvent.change(originalInput, { target: { value: '100' } });
    fireEvent.change(newInput, { target: { value: '80' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('20.00%')).toBeInTheDocument();
      expect(screen.getByText('100 decreased to 80 is a 20.00% decrease')).toBeInTheDocument();
    });
    
    expect(mockOnCalculate).toHaveBeenCalledWith({
      type: 'decrease',
      value1: 100,
      value2: 80,
      result: 20,
      explanation: '100 decreased to 80 is a 20.00% decrease',
      formula: '((100 - 80) ÷ 100) × 100 = 20.00%'
    });
  });

  it('calculates percentage of total correctly', async () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    // Switch to percentage of total
    const ofTotalButton = screen.getByText('Of Total');
    fireEvent.click(ofTotalButton);
    
    const partInput = screen.getByPlaceholderText(/enter part/i);
    const totalInput = screen.getByPlaceholderText(/enter total/i);
    const calculateButton = screen.getByRole('button', { name: /calculate percentage/i });
    
    fireEvent.change(partInput, { target: { value: '25' } });
    fireEvent.change(totalInput, { target: { value: '100' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('25.00%')).toBeInTheDocument();
      expect(screen.getByText('25 is 25.00% of 100')).toBeInTheDocument();
    });
    
    expect(mockOnCalculate).toHaveBeenCalledWith({
      type: 'of-total',
      value1: 25,
      value2: 100,
      result: 25,
      explanation: '25 is 25.00% of 100',
      formula: '(25 ÷ 100) × 100 = 25.00%'
    });
  });

  it('calculates percentage change correctly', async () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    // Switch to percentage change
    const changeButton = screen.getByText('Change');
    fireEvent.click(changeButton);
    
    const oldInput = screen.getByPlaceholderText(/enter old value/i);
    const newInput = screen.getByPlaceholderText(/enter new value/i);
    const calculateButton = screen.getByRole('button', { name: /calculate percentage/i });
    
    fireEvent.change(oldInput, { target: { value: '100' } });
    fireEvent.change(newInput, { target: { value: '120' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('20.00%')).toBeInTheDocument();
      expect(screen.getByText('Change from 100 to 120 is 20.00% increase')).toBeInTheDocument();
    });
    
    expect(mockOnCalculate).toHaveBeenCalledWith({
      type: 'change',
      value1: 100,
      value2: 120,
      result: 20,
      explanation: 'Change from 100 to 120 is 20.00% increase',
      formula: '((120 - 100) ÷ |100|) × 100 = 20.00%'
    });
  });

  it('handles decimal inputs correctly', async () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    const numberInput = screen.getByPlaceholderText(/enter number/i);
    const percentageInput = screen.getByPlaceholderText(/enter percentage/i);
    const calculateButton = screen.getByRole('button', { name: /calculate percentage/i });
    
    fireEvent.change(numberInput, { target: { value: '123.45' } });
    fireEvent.change(percentageInput, { target: { value: '12.5' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('15.43')).toBeInTheDocument();
    });
    
    expect(mockOnCalculate).toHaveBeenCalledWith({
      type: 'basic',
      value1: 123.45,
      value2: 12.5,
      result: 15.43125,
      explanation: '12.5% of 123.45 is 15.43125',
      formula: '(123.45 × 12.5) ÷ 100 = 15.43125'
    });
  });

  it('does not calculate with invalid inputs', () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    const numberInput = screen.getByPlaceholderText(/enter number/i);
    const percentageInput = screen.getByPlaceholderText(/enter percentage/i);
    const calculateButton = screen.getByRole('button', { name: /calculate percentage/i });
    
    fireEvent.change(numberInput, { target: { value: 'invalid' } });
    fireEvent.change(percentageInput, { target: { value: '25' } });
    
    expect(calculateButton).toBeDisabled();
    
    fireEvent.change(numberInput, { target: { value: '100' } });
    fireEvent.change(percentageInput, { target: { value: 'invalid' } });
    
    expect(calculateButton).toBeDisabled();
  });

  it('handles negative percentage change correctly', async () => {
    render(<PercentageCalculator onCalculate={mockOnCalculate} />);
    
    // Switch to percentage change
    const changeButton = screen.getByText('Change');
    fireEvent.click(changeButton);
    
    const oldInput = screen.getByPlaceholderText(/enter old value/i);
    const newInput = screen.getByPlaceholderText(/enter new value/i);
    const calculateButton = screen.getByRole('button', { name: /calculate percentage/i });
    
    fireEvent.change(oldInput, { target: { value: '100' } });
    fireEvent.change(newInput, { target: { value: '80' } });
    fireEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('-20.00%')).toBeInTheDocument();
      expect(screen.getByText('Change from 100 to 80 is 20.00% decrease')).toBeInTheDocument();
    });
    
    expect(mockOnCalculate).toHaveBeenCalledWith({
      type: 'change',
      value1: 100,
      value2: 80,
      result: -20,
      explanation: 'Change from 100 to 80 is 20.00% decrease',
      formula: '((80 - 100) ÷ |100|) × 100 = -20.00%'
    });
  });
});