import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RandomGeneratorPage from '../pages/RandomGeneratorPage';

const renderRandomGenerator = () => {
  return render(
    <BrowserRouter>
      <RandomGeneratorPage />
    </BrowserRouter>
  );
};

describe('Random Generator', () => {
  test('renders random generator interface', () => {
    renderRandomGenerator();
    expect(screen.getByText('Random Generator')).toBeInTheDocument();
    expect(screen.getByText('Random Numbers')).toBeInTheDocument();
  });

  test('generates random numbers', () => {
    renderRandomGenerator();
    const generateButton = screen.getByText('Generate Numbers');
    
    fireEvent.click(generateButton);
    expect(screen.getByText('Generated Numbers')).toBeInTheDocument();
  });

  test('changes number range', () => {
    renderRandomGenerator();
    const minInput = screen.getByDisplayValue('1');
    const maxInput = screen.getByDisplayValue('100');
    
    fireEvent.change(minInput, { target: { value: '10' } });
    fireEvent.change(maxInput, { target: { value: '50' } });
    
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  test('generates random strings', () => {
    renderRandomGenerator();
    const stringsTab = screen.getByText('Strings');
    
    fireEvent.click(stringsTab);
    expect(screen.getByText('Random Strings')).toBeInTheDocument();
    
    const generateButton = screen.getByText('Generate String');
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Generated String')).toBeInTheDocument();
  });

  test('configures string options', () => {
    renderRandomGenerator();
    const stringsTab = screen.getByText('Strings');
    fireEvent.click(stringsTab);
    
    const uppercaseCheckbox = screen.getByLabelText(/uppercase/i);
    const symbolsCheckbox = screen.getByLabelText(/symbols/i);
    
    fireEvent.click(uppercaseCheckbox);
    fireEvent.click(symbolsCheckbox);
    
    expect(uppercaseCheckbox).not.toBeChecked();
    expect(symbolsCheckbox).toBeChecked();
  });

  test('generates UUIDs', () => {
    renderRandomGenerator();
    const uuidTab = screen.getByText('UUID');
    
    fireEvent.click(uuidTab);
    expect(screen.getByText('UUID Generator')).toBeInTheDocument();
    
    const generateButton = screen.getByText('Generate UUID');
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Generated UUID')).toBeInTheDocument();
  });

  test('generates random colors', () => {
    renderRandomGenerator();
    const colorsTab = screen.getByText('Colors');
    
    fireEvent.click(colorsTab);
    expect(screen.getByText('Random Colors')).toBeInTheDocument();
    
    const generateButton = screen.getByText('Generate Color');
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Generated Color')).toBeInTheDocument();
  });

  test('copies generated values', async () => {
    renderRandomGenerator();
    const generateButton = screen.getByText('Generate Numbers');
    
    fireEvent.click(generateButton);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('maintains generation history', () => {
    renderRandomGenerator();
    const generateButton = screen.getByText('Generate Numbers');
    
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Recent Generations')).toBeInTheDocument();
  });

  test('adjusts string length', () => {
    renderRandomGenerator();
    const stringsTab = screen.getByText('Strings');
    fireEvent.click(stringsTab);
    
    const lengthSlider = screen.getByRole('slider');
    fireEvent.change(lengthSlider, { target: { value: '20' } });
    
    expect(screen.getByText('Length: 20')).toBeInTheDocument();
  });
});