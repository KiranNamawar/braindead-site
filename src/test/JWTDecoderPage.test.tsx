import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import JWTDecoderPage from '../pages/JWTDecoderPage';

// Simple test wrapper
const renderWithProviders = (component: React.ReactElement) => {
  return render(component);
};

describe('JWT Decoder', () => {
  it('renders JWT decoder interface', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    expect(screen.getByText('JWT Decoder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/paste your jwt token/i)).toBeInTheDocument();
    expect(screen.getByText('Sample JWTs')).toBeInTheDocument();
  });

  it('shows JWT structure information', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    expect(screen.getByText('🔐 JWT Structure')).toBeInTheDocument();
    expect(screen.getByText(/Contains algorithm and token type/)).toBeInTheDocument();
    expect(screen.getByText(/Contains claims \(user data\)/)).toBeInTheDocument();
  });
});