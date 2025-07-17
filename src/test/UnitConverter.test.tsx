import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UnitConverterPage from '../pages/UnitConverterPage';

const renderUnitConverter = () => {
  return render(
    <BrowserRouter>
      <UnitConverterPage />
    </BrowserRouter>
  );
};

describe('Unit Converter', () => {
  test('renders unit converter interface', () => {
    renderUnitConverter();
    expect(screen.getByText('Unit Converter')).toBeInTheDocument();
    expect(screen.getByText('Length Converter')).toBeInTheDocument();
  });

  test('converts length units', () => {
    renderUnitConverter();
    const fromInput = screen.getByPlaceholderText('Enter value');
    
    fireEvent.change(fromInput, { target: { value: '100' } });
    
    // Should show conversion result
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  test('switches between categories', () => {
    renderUnitConverter();
    const weightTab = screen.getByText('Weight');
    
    fireEvent.click(weightTab);
    expect(screen.getByText('Weight Converter')).toBeInTheDocument();
  });

  test('swaps units', () => {
    renderUnitConverter();
    const fromInput = screen.getByPlaceholderText('Enter value');
    const swapButton = screen.getByRole('button', { name: /swap/i });
    
    fireEvent.change(fromInput, { target: { value: '100' } });
    fireEvent.click(swapButton);
    
    // Values should be swapped
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  test('handles temperature conversion', () => {
    renderUnitConverter();
    const temperatureTab = screen.getByText('Temperature');
    
    fireEvent.click(temperatureTab);
    expect(screen.getByText('Temperature Converter')).toBeInTheDocument();
    
    const fromInput = screen.getByPlaceholderText('Enter value');
    fireEvent.change(fromInput, { target: { value: '32' } });
    
    // Should convert Fahrenheit to Celsius (0)
    expect(screen.getByDisplayValue(/0/)).toBeInTheDocument();
  });

  test('shows conversion history', () => {
    renderUnitConverter();
    const fromInput = screen.getByPlaceholderText('Enter value');
    
    fireEvent.change(fromInput, { target: { value: '100' } });
    
    expect(screen.getByText('Recent Conversions')).toBeInTheDocument();
  });

  test('uses quick conversions', () => {
    renderUnitConverter();
    const quickConversion = screen.getByText('1 mm');
    
    fireEvent.click(quickConversion);
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });

  test('handles volume conversions', () => {
    renderUnitConverter();
    const volumeTab = screen.getByText('Volume');
    
    fireEvent.click(volumeTab);
    expect(screen.getByText('Volume Converter')).toBeInTheDocument();
  });

  test('handles area conversions', () => {
    renderUnitConverter();
    const areaTab = screen.getByText('Area');
    
    fireEvent.click(areaTab);
    expect(screen.getByText('Area Converter')).toBeInTheDocument();
  });

  test('handles speed conversions', () => {
    renderUnitConverter();
    const speedTab = screen.getByText('Speed');
    
    fireEvent.click(speedTab);
    expect(screen.getByText('Speed Converter')).toBeInTheDocument();
  });
});