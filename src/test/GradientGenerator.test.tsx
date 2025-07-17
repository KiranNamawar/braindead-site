import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import GradientGeneratorPage from '../pages/GradientGeneratorPage';
import { ToastProvider } from '../components/ToastContainer';

// Mock analytics
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

describe('Gradient Generator', () => {
  test('renders gradient generator interface', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    expect(screen.getByText('CSS Gradient Generator')).toBeInTheDocument();
    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByText('Radial')).toBeInTheDocument();
    expect(screen.getByText('Conic')).toBeInTheDocument();
  });

  test('generates linear gradient by default', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    expect(screen.getByText('linear-gradient')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/linear-gradient/)).toBeInTheDocument();
  });

  test('switches to radial gradient', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const radialButton = screen.getByText('Radial');
    fireEvent.click(radialButton);
    
    expect(screen.getByDisplayValue(/radial-gradient/)).toBeInTheDocument();
  });

  test('switches to conic gradient', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const conicButton = screen.getByText('Conic');
    fireEvent.click(conicButton);
    
    expect(screen.getByDisplayValue(/conic-gradient/)).toBeInTheDocument();
  });

  test('changes gradient direction', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const directionSelect = screen.getByLabelText(/direction/i);
    fireEvent.change(directionSelect, { target: { value: '90deg' } });
    
    expect(screen.getByDisplayValue(/90deg/)).toBeInTheDocument();
  });

  test('adds color stop', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const addColorButton = screen.getByText('Add Color');
    fireEvent.click(addColorButton);
    
    // Should have more than 2 color inputs now
    const colorInputs = screen.getAllByLabelText(/color/i);
    expect(colorInputs.length).toBeGreaterThan(2);
  });

  test('removes color stop', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const addColorButton = screen.getByText('Add Color');
    fireEvent.click(addColorButton);
    
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    // Should have fewer color inputs
    const colorInputs = screen.getAllByLabelText(/color/i);
    expect(colorInputs.length).toBeLessThanOrEqual(3);
  });

  test('changes color values', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const colorInputs = screen.getAllByLabelText(/color/i);
    fireEvent.change(colorInputs[0], { target: { value: '#ff0000' } });
    
    expect(screen.getByDisplayValue(/#ff0000/)).toBeInTheDocument();
  });

  test('adjusts color stop positions', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const positionSliders = screen.getAllByLabelText(/position/i);
    fireEvent.change(positionSliders[0], { target: { value: '25' } });
    
    expect(screen.getByDisplayValue(/25%/)).toBeInTheDocument();
  });

  test('copies CSS code to clipboard', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const copyButton = screen.getByText('Copy CSS');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('downloads CSS file', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const downloadButton = screen.getByText('Download CSS');
    fireEvent.click(downloadButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('shows gradient preview', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    expect(screen.getByText('Preview')).toBeInTheDocument();
    // Preview should have gradient background style
    const preview = screen.getByTestId('gradient-preview');
    expect(preview).toHaveStyle(/background.*gradient/);
  });

  test('uses preset gradients', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const presetButton = screen.getByText('Sunset');
    fireEvent.click(presetButton);
    
    // Should update the gradient with preset colors
    expect(screen.getByDisplayValue(/linear-gradient/)).toBeInTheDocument();
  });

  test('randomizes gradient colors', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const randomButton = screen.getByText('Random Colors');
    fireEvent.click(randomButton);
    
    // Should generate new random colors
    expect(screen.getByDisplayValue(/linear-gradient/)).toBeInTheDocument();
  });

  test('exports gradient as image', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const exportImageButton = screen.getByText('Export as PNG');
    fireEvent.click(exportImageButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('adjusts gradient size for radial', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const radialButton = screen.getByText('Radial');
    fireEvent.click(radialButton);
    
    const sizeSelect = screen.getByLabelText(/size/i);
    fireEvent.change(sizeSelect, { target: { value: 'closest-side' } });
    
    expect(screen.getByDisplayValue(/closest-side/)).toBeInTheDocument();
  });

  test('sets gradient position for radial', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const radialButton = screen.getByText('Radial');
    fireEvent.click(radialButton);
    
    const positionSelect = screen.getByLabelText(/position/i);
    fireEvent.change(positionSelect, { target: { value: 'center' } });
    
    expect(screen.getByDisplayValue(/at center/)).toBeInTheDocument();
  });

  test('handles invalid color input', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const colorInputs = screen.getAllByLabelText(/color/i);
    fireEvent.change(colorInputs[0], { target: { value: 'invalid-color' } });
    
    // Should show error or revert to valid color
    expect(screen.getByText(/invalid color/i)).toBeInTheDocument();
  });

  test('shows CSS code with proper formatting', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    expect(screen.getByText('CSS Code')).toBeInTheDocument();
    const cssCode = screen.getByDisplayValue(/background.*linear-gradient/);
    expect(cssCode).toBeInTheDocument();
  });

  test('provides multiple CSS properties', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    expect(screen.getByText('background:')).toBeInTheDocument();
    expect(screen.getByText('background-image:')).toBeInTheDocument();
  });

  test('resets gradient to default', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    // Make some changes first
    const addColorButton = screen.getByText('Add Color');
    fireEvent.click(addColorButton);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Should return to default state
    const colorInputs = screen.getAllByLabelText(/color/i);
    expect(colorInputs.length).toBe(2);
  });

  test('shows gradient angle indicator', () => {
    renderWithProviders(<GradientGeneratorPage />);
    
    const angleSlider = screen.getByLabelText(/angle/i);
    fireEvent.change(angleSlider, { target: { value: '45' } });
    
    expect(screen.getByText('45°')).toBeInTheDocument();
  });
});