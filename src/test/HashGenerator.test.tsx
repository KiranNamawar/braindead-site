import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HashGeneratorPage from '../pages/HashGeneratorPage';

const renderHashGenerator = () => {
  return render(
    <BrowserRouter>
      <HashGeneratorPage />
    </BrowserRouter>
  );
};

describe('Hash Generator', () => {
  test('renders hash generator interface', () => {
    renderHashGenerator();
    expect(screen.getByText('Hash Generator')).toBeInTheDocument();
    expect(screen.getByText('Input')).toBeInTheDocument();
  });

  test('generates hashes for input text', () => {
    renderHashGenerator();
    const textInput = screen.getByPlaceholderText(/enter text to hash/i);
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    
    expect(screen.getByText('MD5')).toBeInTheDocument();
    expect(screen.getByText('SHA1')).toBeInTheDocument();
    expect(screen.getByText('SHA256')).toBeInTheDocument();
    expect(screen.getByText('SHA512')).toBeInTheDocument();
  });

  test('displays different hash lengths', () => {
    renderHashGenerator();
    const textInput = screen.getByPlaceholderText(/enter text to hash/i);
    
    fireEvent.change(textInput, { target: { value: 'test' } });
    
    expect(screen.getByText('(32 chars)')).toBeInTheDocument(); // MD5
    expect(screen.getByText('(40 chars)')).toBeInTheDocument(); // SHA1
    expect(screen.getByText('(64 chars)')).toBeInTheDocument(); // SHA256
    expect(screen.getByText('(128 chars)')).toBeInTheDocument(); // SHA512
  });

  test('copies hash to clipboard', async () => {
    renderHashGenerator();
    const textInput = screen.getByPlaceholderText(/enter text to hash/i);
    
    fireEvent.change(textInput, { target: { value: 'test' } });
    
    const copyButtons = screen.getAllByRole('button', { name: /copy/i });
    fireEvent.click(copyButtons[0]);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('handles file upload', () => {
    renderHashGenerator();
    const fileInput = screen.getByLabelText(/upload file/i);
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(fileInput.files[0]).toBe(file);
  });

  test('uses preset inputs', () => {
    renderHashGenerator();
    const presetButton = screen.getByText('Hello, World!');
    
    fireEvent.click(presetButton);
    expect(screen.getByDisplayValue('Hello, World!')).toBeInTheDocument();
  });

  test('maintains hash history', () => {
    renderHashGenerator();
    const textInput = screen.getByPlaceholderText(/enter text to hash/i);
    
    fireEvent.change(textInput, { target: { value: 'test' } });
    
    const copyButtons = screen.getAllByRole('button', { name: /copy/i });
    fireEvent.click(copyButtons[0]);
    
    expect(screen.getByText('Recent Hashes')).toBeInTheDocument();
  });

  test('shows algorithm descriptions', () => {
    renderHashGenerator();
    expect(screen.getByText(/Fast but cryptographically broken/)).toBeInTheDocument();
    expect(screen.getByText(/Deprecated for security/)).toBeInTheDocument();
    expect(screen.getByText(/Secure and widely used/)).toBeInTheDocument();
    expect(screen.getByText(/Most secure option/)).toBeInTheDocument();
  });
});