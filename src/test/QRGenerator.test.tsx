import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QRGeneratorPage from '../pages/QRGeneratorPage';

const renderQRGenerator = () => {
  return render(
    <BrowserRouter>
      <QRGeneratorPage />
    </BrowserRouter>
  );
};

describe('QR Generator', () => {
  test('renders QR generator interface', () => {
    renderQRGenerator();
    expect(screen.getByText('QR Code Generator')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('displays default text', () => {
    renderQRGenerator();
    expect(screen.getByDisplayValue('https://braindead.site')).toBeInTheDocument();
  });

  test('updates text input', () => {
    renderQRGenerator();
    const textInput = screen.getByPlaceholderText(/enter text/i);
    
    fireEvent.change(textInput, { target: { value: 'Hello World' } });
    expect(screen.getByDisplayValue('Hello World')).toBeInTheDocument();
  });

  test('changes QR size', () => {
    renderQRGenerator();
    const sizeSelect = screen.getByDisplayValue('Medium (200px)');
    
    fireEvent.change(sizeSelect, { target: { value: '300' } });
    expect(screen.getByDisplayValue('Large (300px)')).toBeInTheDocument();
  });

  test('changes error correction level', () => {
    renderQRGenerator();
    const errorSelect = screen.getByDisplayValue('Medium (~15%)');
    
    fireEvent.change(errorSelect, { target: { value: 'H' } });
    expect(screen.getByDisplayValue('High (~30%)')).toBeInTheDocument();
  });

  test('updates foreground color', () => {
    renderQRGenerator();
    const colorInput = screen.getByDisplayValue('#000000');
    
    fireEvent.change(colorInput, { target: { value: '#FF0000' } });
    expect(screen.getByDisplayValue('#FF0000')).toBeInTheDocument();
  });

  test('generates QR code', () => {
    renderQRGenerator();
    const generateButton = screen.getByText('Generate QR');
    
    fireEvent.click(generateButton);
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  test('downloads QR code', () => {
    renderQRGenerator();
    const downloadButton = screen.getByText('Download');
    
    fireEvent.click(downloadButton);
    // Canvas toDataURL should be called
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
  });

  test('uses preset texts', () => {
    renderQRGenerator();
    const presetButton = screen.getByText('Hello, World!');
    
    fireEvent.click(presetButton);
    expect(screen.getByDisplayValue('Hello, World!')).toBeInTheDocument();
  });
});