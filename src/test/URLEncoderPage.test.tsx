import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import URLEncoderPage from '../pages/URLEncoderPage';

// Simple test wrapper
const renderWithProviders = (component: React.ReactElement) => {
  return render(component);
};

describe('URL Encoder/Decoder', () => {
  it('renders URL encoder interface', () => {
    renderWithProviders(<URLEncoderPage />);
    
    expect(screen.getByText('URL Encoder/Decoder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter text or url to encode/i)).toBeInTheDocument();
    expect(screen.getByText('Encode')).toBeInTheDocument();
  });

  it('encodes URL with special characters', () => {
    renderWithProviders(<URLEncoderPage />);
    
    const textInput = screen.getByPlaceholderText(/enter text or url to encode/i);
    const encodeButton = screen.getByText('Encode');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(encodeButton);
    
    expect(screen.getByDisplayValue('hello%20world')).toBeInTheDocument();
  });
});