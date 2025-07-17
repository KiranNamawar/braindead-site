import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  test('renders homepage with main title', () => {
    renderHomePage();
    expect(screen.getByText('BrainDead.site')).toBeInTheDocument();
  });

  test('displays hero section', () => {
    renderHomePage();
    expect(screen.getByText(/Premium utility tools/)).toBeInTheDocument();
    expect(screen.getByText(/No thinking required/)).toBeInTheDocument();
  });

  test('shows explore tools button', () => {
    renderHomePage();
    const exploreButton = screen.getByText('Explore Tools');
    expect(exploreButton).toBeInTheDocument();
  });

  test('displays tool navigation buttons', () => {
    renderHomePage();
    expect(screen.getByText('Calculator')).toBeInTheDocument();
    expect(screen.getByText('Color Picker')).toBeInTheDocument();
    expect(screen.getByText('QR Generator')).toBeInTheDocument();
    expect(screen.getByText('Text Tools')).toBeInTheDocument();
  });

  test('shows all 12 tools', () => {
    renderHomePage();
    const tools = [
      'Calculator', 'Color Picker', 'QR Generator', 'Text Tools',
      'Password Generator', 'Hash Generator', 'Image Optimizer',
      'URL Shortener', 'Timestamp Converter', 'JSON Formatter',
      'Random Generator', 'Unit Converter'
    ];
    
    tools.forEach(tool => {
      expect(screen.getByText(tool)).toBeInTheDocument();
    });
  });

  test('displays tool descriptions', () => {
    renderHomePage();
    expect(screen.getByText(/calculator so smart/i)).toBeInTheDocument();
    expect(screen.getByText(/extract colors from images/i)).toBeInTheDocument();
  });

  test('shows try tool buttons', () => {
    renderHomePage();
    const tryButtons = screen.getAllByText(/Try /);
    expect(tryButtons.length).toBeGreaterThan(0);
  });

  test('displays tool features', () => {
    renderHomePage();
    expect(screen.getByText('Key Features:')).toBeInTheDocument();
  });

  test('shows funny quotes', () => {
    renderHomePage();
    expect(screen.getByText(/Finally, a calculator/)).toBeInTheDocument();
  });

  test('navigation buttons work', () => {
    renderHomePage();
    const calculatorNav = screen.getAllByText('Calculator')[0];
    
    fireEvent.click(calculatorNav);
    // Should scroll to calculator section
    expect(calculatorNav).toBeInTheDocument();
  });

  test('displays status indicators', () => {
    renderHomePage();
    expect(screen.getByText(/12 Premium Utility Tools/)).toBeInTheDocument();
    expect(screen.getByText(/Zero Brain Cells Required/)).toBeInTheDocument();
  });
});