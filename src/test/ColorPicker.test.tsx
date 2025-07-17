import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ColorPickerPage from '../pages/ColorPickerPage';

const renderColorPicker = () => {
  return render(
    <BrowserRouter>
      <ColorPickerPage />
    </BrowserRouter>
  );
};

describe('Color Picker', () => {
  test('renders color picker interface', () => {
    renderColorPicker();
    expect(screen.getByText('Color Picker')).toBeInTheDocument();
    expect(screen.getByText('Color Selector')).toBeInTheDocument();
  });

  test('displays default color', () => {
    renderColorPicker();
    const colorInput = screen.getByDisplayValue('#3B82F6');
    expect(colorInput).toBeInTheDocument();
  });

  test('updates color when input changes', () => {
    renderColorPicker();
    const colorInput = screen.getByDisplayValue('#3B82F6');
    
    fireEvent.change(colorInput, { target: { value: '#FF0000' } });
    expect(screen.getByDisplayValue('#FF0000')).toBeInTheDocument();
  });

  test('generates color palette', () => {
    renderColorPicker();
    const generateButton = screen.getByText('Generate Palette');
    
    fireEvent.click(generateButton);
    expect(screen.getByText('Generated Palette')).toBeInTheDocument();
  });

  test('displays color formats', () => {
    renderColorPicker();
    expect(screen.getByText('HEX')).toBeInTheDocument();
    expect(screen.getByText('RGB')).toBeInTheDocument();
    expect(screen.getByText('HSL')).toBeInTheDocument();
  });

  test('copies color to clipboard', async () => {
    renderColorPicker();
    const copyButtons = screen.getAllByRole('button', { name: /copy/i });
    
    fireEvent.click(copyButtons[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('handles file upload', () => {
    renderColorPicker();
    const fileInput = screen.getByLabelText(/upload image/i);
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(fileInput.files[0]).toBe(file);
  });
});