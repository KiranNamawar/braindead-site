import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CalculatorPage from '../pages/CalculatorPage';

const renderCalculator = () => {
  return render(
    <BrowserRouter>
      <CalculatorPage />
    </BrowserRouter>
  );
};

describe('Calculator', () => {
  test('renders calculator interface', () => {
    renderCalculator();
    expect(screen.getByText('Calculator')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('performs basic addition', () => {
    renderCalculator();
    
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('performs basic subtraction', () => {
    renderCalculator();
    
    fireEvent.click(screen.getByText('5'));
    fireEvent.click(screen.getByText('-'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('='));
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('performs multiplication', () => {
    renderCalculator();
    
    fireEvent.click(screen.getByText('4'));
    fireEvent.click(screen.getByText('×'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));
    
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  test('performs division', () => {
    renderCalculator();
    
    fireEvent.click(screen.getByText('8'));
    fireEvent.click(screen.getByText('÷'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('='));
    
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('handles decimal numbers', () => {
    renderCalculator();
    
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('.'));
    fireEvent.click(screen.getByText('5'));
    
    expect(screen.getByText('3.5')).toBeInTheDocument();
  });

  test('clears display', () => {
    renderCalculator();
    
    fireEvent.click(screen.getByText('5'));
    expect(screen.getByText('5')).toBeInTheDocument();
    
    const clearButton = screen.getByRole('button', { name: /clear|reset/i });
    fireEvent.click(clearButton);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('maintains calculation history', () => {
    renderCalculator();
    
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('='));
    
    expect(screen.getByText(/2 \+ 3 = 5/)).toBeInTheDocument();
  });
});