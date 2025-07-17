import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import JWTDecoderPage from '../pages/JWTDecoderPage';
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

describe('JWT Decoder', () => {
  const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  test('renders JWT decoder interface', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    expect(screen.getByText('JWT Decoder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/paste your jwt token/i)).toBeInTheDocument();
    expect(screen.getByText('Decode JWT')).toBeInTheDocument();
  });

  test('decodes valid JWT token', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Payload')).toBeInTheDocument();
    expect(screen.getByText('Signature')).toBeInTheDocument();
  });

  test('displays JWT header correctly', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText('"alg": "HS256"')).toBeInTheDocument();
    expect(screen.getByText('"typ": "JWT"')).toBeInTheDocument();
  });

  test('displays JWT payload correctly', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText('"sub": "1234567890"')).toBeInTheDocument();
    expect(screen.getByText('"name": "John Doe"')).toBeInTheDocument();
    expect(screen.getByText('"iat": 1516239022')).toBeInTheDocument();
  });

  test('handles invalid JWT format', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: 'invalid.jwt.token' } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/invalid jwt token/i)).toBeInTheDocument();
  });

  test('handles malformed JWT parts', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: 'header.payload' } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/invalid jwt format/i)).toBeInTheDocument();
  });

  test('handles empty input', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const decodeButton = screen.getByText('Decode JWT');
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/please enter a jwt token/i)).toBeInTheDocument();
  });

  test('copies header to clipboard', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    const copyHeaderButton = screen.getByText('Copy Header');
    fireEvent.click(copyHeaderButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('"alg": "HS256"')
    );
  });

  test('copies payload to clipboard', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    const copyPayloadButton = screen.getByText('Copy Payload');
    fireEvent.click(copyPayloadButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('"sub": "1234567890"')
    );
  });

  test('shows JWT structure explanation', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    expect(screen.getByText(/jwt structure/i)).toBeInTheDocument();
    expect(screen.getByText(/header\.payload\.signature/i)).toBeInTheDocument();
  });

  test('displays token expiration info', () => {
    const expiredJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ';
    
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: expiredJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/expires/i)).toBeInTheDocument();
  });

  test('validates JWT signature info', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/signature verification/i)).toBeInTheDocument();
    expect(screen.getByText(/requires secret key/i)).toBeInTheDocument();
  });

  test('handles JWT with special characters', () => {
    const specialJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwi8J-YgCI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyfQ.invalid';
    
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: specialJWT } });
    fireEvent.click(decodeButton);
    
    // Should handle special characters in payload
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Payload')).toBeInTheDocument();
  });

  test('shows algorithm information', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/algorithm.*hs256/i)).toBeInTheDocument();
  });

  test('displays token type information', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/type.*jwt/i)).toBeInTheDocument();
  });

  test('handles JWT without optional claims', () => {
    const minimalJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.invalid';
    
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: minimalJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText('"sub": "1234567890"')).toBeInTheDocument();
  });

  test('clears decoded results', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(jwtInput).toHaveValue('');
    expect(screen.queryByText('Header')).not.toBeInTheDocument();
  });

  test('shows JSON formatting options', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText('Pretty Print')).toBeInTheDocument();
  });

  test('handles very long JWT tokens', () => {
    const longPayload = { data: 'x'.repeat(1000) };
    const longJWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(longPayload))}.signature`;
    
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: longJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText('Payload')).toBeInTheDocument();
  });

  test('provides JWT security warnings', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    expect(screen.getByText(/security note/i)).toBeInTheDocument();
    expect(screen.getByText(/never share/i)).toBeInTheDocument();
  });

  test('shows common JWT claims explanations', () => {
    renderWithProviders(<JWTDecoderPage />);
    
    const jwtInput = screen.getByPlaceholderText(/paste your jwt token/i);
    const decodeButton = screen.getByText('Decode JWT');
    
    fireEvent.change(jwtInput, { target: { value: validJWT } });
    fireEvent.click(decodeButton);
    
    expect(screen.getByText(/iat.*issued at/i)).toBeInTheDocument();
    expect(screen.getByText(/sub.*subject/i)).toBeInTheDocument();
  });
});