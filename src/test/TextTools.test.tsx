import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TextToolsPage from '../pages/TextToolsPage';

const renderTextTools = () => {
  return render(
    <BrowserRouter>
      <TextToolsPage />
    </BrowserRouter>
  );
};

describe('Text Tools', () => {
  test('renders text tools interface', () => {
    renderTextTools();
    expect(screen.getByText('Text Tools')).toBeInTheDocument();
    expect(screen.getByText('Input Text')).toBeInTheDocument();
  });

  test('transforms text to uppercase', () => {
    renderTextTools();
    const textInput = screen.getByPlaceholderText(/paste or type/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(uppercaseButton);
    
    expect(screen.getByDisplayValue('HELLO WORLD')).toBeInTheDocument();
  });

  test('transforms text to lowercase', () => {
    renderTextTools();
    const textInput = screen.getByPlaceholderText(/paste or type/i);
    const lowercaseButton = screen.getByText('lowercase');
    
    fireEvent.change(textInput, { target: { value: 'HELLO WORLD' } });
    fireEvent.click(lowercaseButton);
    
    expect(screen.getByDisplayValue('hello world')).toBeInTheDocument();
  });

  test('capitalizes words', () => {
    renderTextTools();
    const textInput = screen.getByPlaceholderText(/paste or type/i);
    const capitalizeButton = screen.getByText('Capitalize Words');
    
    fireEvent.change(textInput, { target: { value: 'hello world' } });
    fireEvent.click(capitalizeButton);
    
    expect(screen.getByDisplayValue('Hello World')).toBeInTheDocument();
  });

  test('reverses text', () => {
    renderTextTools();
    const textInput = screen.getByPlaceholderText(/paste or type/i);
    const reverseButton = screen.getByText('Reverse Text');
    
    fireEvent.change(textInput, { target: { value: 'hello' } });
    fireEvent.click(reverseButton);
    
    expect(screen.getByDisplayValue('olleh')).toBeInTheDocument();
  });

  test('removes spaces', () => {
    renderTextTools();
    const textInput = screen.getByPlaceholderText(/paste or type/i);
    const removeSpacesButton = screen.getByText('Remove Spaces');
    
    fireEvent.change(textInput, { target: { value: 'hello world test' } });
    fireEvent.click(removeSpacesButton);
    
    expect(screen.getByDisplayValue('helloworldtest')).toBeInTheDocument();
  });

  test('adds line numbers', () => {
    renderTextTools();
    const textInput = screen.getByPlaceholderText(/paste or type/i);
    const lineNumbersButton = screen.getByText('Add Line Numbers');
    
    fireEvent.change(textInput, { target: { value: 'line one\nline two' } });
    fireEvent.click(lineNumbersButton);
    
    expect(screen.getByDisplayValue('1. line one\n2. line two')).toBeInTheDocument();
  });

  test('analyzes text statistics', () => {
    renderTextTools();
    const textInput = screen.getByPlaceholderText(/paste or type/i);
    const analyzeTab = screen.getByText('Analyze');
    
    fireEvent.change(textInput, { target: { value: 'hello world test' } });
    fireEvent.click(analyzeTab);
    
    expect(screen.getByText('3')).toBeInTheDocument(); // Words count
    expect(screen.getByText('17')).toBeInTheDocument(); // Characters count
  });

  test('extracts emails', () => {
    renderTextTools();
    const textInput = screen.getByPlaceholderText(/paste or type/i);
    const extractEmailsButton = screen.getByText('Extract Emails');
    
    fireEvent.change(textInput, { target: { value: 'Contact us at test@example.com or admin@site.org' } });
    fireEvent.click(extractEmailsButton);
    
    expect(screen.getByDisplayValue(/test@example.com/)).toBeInTheDocument();
  });

  test('copies output text', async () => {
    renderTextTools();
    const textInput = screen.getByPlaceholderText(/paste or type/i);
    const uppercaseButton = screen.getByText('UPPERCASE');
    
    fireEvent.change(textInput, { target: { value: 'hello' } });
    fireEvent.click(uppercaseButton);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('HELLO');
  });
});