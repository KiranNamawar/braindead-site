import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import JSONFormatterPage from '../pages/JSONFormatterPage';

const renderJSONFormatter = () => {
  return render(
    <BrowserRouter>
      <JSONFormatterPage />
    </BrowserRouter>
  );
};

describe('JSON Formatter', () => {
  test('renders JSON formatter interface', () => {
    renderJSONFormatter();
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
    expect(screen.getByText('Input JSON')).toBeInTheDocument();
  });

  test('formats valid JSON', () => {
    renderJSONFormatter();
    const textInput = screen.getByPlaceholderText(/paste your json/i);
    const formatButton = screen.getByText('Format');
    
    fireEvent.change(textInput, { target: { value: '{"name":"John","age":30}' } });
    fireEvent.click(formatButton);
    
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  test('minifies JSON', () => {
    renderJSONFormatter();
    const textInput = screen.getByPlaceholderText(/paste your json/i);
    const minifyButton = screen.getByText('Minify');
    
    fireEvent.change(textInput, { 
      target: { value: '{\n  "name": "John",\n  "age": 30\n}' } 
    });
    fireEvent.click(minifyButton);
    
    expect(screen.getByDisplayValue('{"name":"John","age":30}')).toBeInTheDocument();
  });

  test('validates invalid JSON', () => {
    renderJSONFormatter();
    const textInput = screen.getByPlaceholderText(/paste your json/i);
    
    fireEvent.change(textInput, { target: { value: '{"name":"John",}' } });
    
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  test('shows JSON statistics', () => {
    renderJSONFormatter();
    const textInput = screen.getByPlaceholderText(/paste your json/i);
    
    fireEvent.change(textInput, { target: { value: '{"name":"John","age":30}' } });
    
    expect(screen.getByText('JSON Statistics')).toBeInTheDocument();
  });

  test('changes indentation size', () => {
    renderJSONFormatter();
    const indentSelect = screen.getByDisplayValue('2 spaces');
    
    fireEvent.change(indentSelect, { target: { value: '4' } });
    expect(screen.getByDisplayValue('4 spaces')).toBeInTheDocument();
  });

  test('uploads JSON file', () => {
    renderJSONFormatter();
    const fileInput = screen.getByLabelText(/upload json/i);
    const file = new File(['{"test": true}'], 'test.json', { type: 'application/json' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(fileInput.files[0]).toBe(file);
  });

  test('uses sample JSONs', () => {
    renderJSONFormatter();
    const sampleButton = screen.getByText('Simple Object');
    
    fireEvent.click(sampleButton);
    expect(screen.getByDisplayValue(/name.*John Doe/)).toBeInTheDocument();
  });

  test('copies formatted JSON', async () => {
    renderJSONFormatter();
    const textInput = screen.getByPlaceholderText(/paste your json/i);
    const formatButton = screen.getByText('Format');
    
    fireEvent.change(textInput, { target: { value: '{"name":"John"}' } });
    fireEvent.click(formatButton);
    
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('downloads formatted JSON', () => {
    renderJSONFormatter();
    const textInput = screen.getByPlaceholderText(/paste your json/i);
    const formatButton = screen.getByText('Format');
    
    fireEvent.change(textInput, { target: { value: '{"name":"John"}' } });
    fireEvent.click(formatButton);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });
});