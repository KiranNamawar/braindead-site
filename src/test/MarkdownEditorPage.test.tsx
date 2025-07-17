import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest';
import MarkdownEditorPage from '../pages/MarkdownEditorPage';
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

describe('Markdown Editor', () => {
  test('renders markdown editor interface', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    expect(screen.getByText('Markdown Editor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/write your markdown/i)).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  test('renders markdown preview', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '# Hello World\n\nThis is **bold** text.' } });
    
    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
    });
  });

  test('handles heading syntax', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '# H1\n## H2\n### H3' } });
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('H1');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('H2');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('H3');
    });
  });

  test('handles bold and italic text', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '**bold** and *italic* text' } });
    
    await waitFor(() => {
      const boldElement = screen.getByText('bold');
      const italicElement = screen.getByText('italic');
      
      expect(boldElement.tagName).toBe('STRONG');
      expect(italicElement.tagName).toBe('EM');
    });
  });

  test('handles code blocks', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '```javascript\nconsole.log("hello");\n```' } });
    
    await waitFor(() => {
      expect(screen.getByText('console.log("hello");')).toBeInTheDocument();
    });
  });

  test('handles inline code', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: 'Use `console.log()` for debugging' } });
    
    await waitFor(() => {
      const codeElement = screen.getByText('console.log()');
      expect(codeElement.tagName).toBe('CODE');
    });
  });

  test('handles lists', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '- Item 1\n- Item 2\n- Item 3' } });
    
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  test('handles numbered lists', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '1. First\n2. Second\n3. Third' } });
    
    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });
  });

  test('handles links', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '[Google](https://google.com)' } });
    
    await waitFor(() => {
      const link = screen.getByText('Google');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', 'https://google.com');
    });
  });

  test('handles images', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '![Alt text](https://example.com/image.jpg)' } });
    
    await waitFor(() => {
      const image = screen.getByAltText('Alt text');
      expect(image.tagName).toBe('IMG');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  test('handles blockquotes', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '> This is a quote' } });
    
    await waitFor(() => {
      const quote = screen.getByText('This is a quote');
      expect(quote.closest('blockquote')).toBeInTheDocument();
    });
  });

  test('handles tables', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { 
      target: { 
        value: '| Name | Age |\n|------|-----|\n| John | 25 |\n| Jane | 30 |' 
      } 
    });
    
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });
  });

  test('provides toolbar buttons', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    expect(screen.getByTitle(/bold/i)).toBeInTheDocument();
    expect(screen.getByTitle(/italic/i)).toBeInTheDocument();
    expect(screen.getByTitle(/heading/i)).toBeInTheDocument();
    expect(screen.getByTitle(/link/i)).toBeInTheDocument();
    expect(screen.getByTitle(/code/i)).toBeInTheDocument();
  });

  test('inserts bold text via toolbar', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    const boldButton = screen.getByTitle(/bold/i);
    
    fireEvent.focus(editor);
    fireEvent.click(boldButton);
    
    expect(editor.value).toContain('**');
  });

  test('inserts italic text via toolbar', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    const italicButton = screen.getByTitle(/italic/i);
    
    fireEvent.focus(editor);
    fireEvent.click(italicButton);
    
    expect(editor.value).toContain('*');
  });

  test('inserts heading via toolbar', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    const headingButton = screen.getByTitle(/heading/i);
    
    fireEvent.focus(editor);
    fireEvent.click(headingButton);
    
    expect(editor.value).toContain('#');
  });

  test('inserts link via toolbar', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    const linkButton = screen.getByTitle(/link/i);
    
    fireEvent.focus(editor);
    fireEvent.click(linkButton);
    
    expect(editor.value).toContain('[');
    expect(editor.value).toContain('](');
  });

  test('copies markdown to clipboard', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '# Test' } });
    
    const copyButton = screen.getByText('Copy Markdown');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('# Test');
  });

  test('copies HTML to clipboard', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '# Test' } });
    
    const copyHtmlButton = screen.getByText('Copy HTML');
    fireEvent.click(copyHtmlButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('<h1>Test</h1>')
    );
  });

  test('downloads markdown file', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '# Test Document' } });
    
    const downloadButton = screen.getByText('Download MD');
    fireEvent.click(downloadButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('downloads HTML file', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '# Test Document' } });
    
    const downloadHtmlButton = screen.getByText('Download HTML');
    fireEvent.click(downloadHtmlButton);
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('clears editor content', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '# Test Content' } });
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(editor).toHaveValue('');
  });

  test('shows character and word count', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: 'Hello world test' } });
    
    expect(screen.getByText(/3.*words/i)).toBeInTheDocument();
    expect(screen.getByText(/16.*characters/i)).toBeInTheDocument();
  });

  test('supports split view mode', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const splitViewButton = screen.getByText('Split View');
    fireEvent.click(splitViewButton);
    
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  test('supports preview-only mode', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    expect(screen.queryByPlaceholderText(/write your markdown/i)).not.toBeVisible();
  });

  test('supports editor-only mode', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editorButton = screen.getByText('Editor');
    fireEvent.click(editorButton);
    
    expect(screen.getByPlaceholderText(/write your markdown/i)).toBeVisible();
  });

  test('handles file upload', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const fileInput = screen.getByLabelText(/upload.*file/i);
    const file = new File(['# Uploaded Content'], 'test.md', { type: 'text/markdown' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      const editor = screen.getByPlaceholderText(/write your markdown/i);
      expect(editor).toHaveValue('# Uploaded Content');
    });
  });

  test('provides markdown syntax help', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const helpButton = screen.getByText('Syntax Help');
    fireEvent.click(helpButton);
    
    expect(screen.getByText(/markdown syntax/i)).toBeInTheDocument();
    expect(screen.getByText(/# heading/i)).toBeInTheDocument();
    expect(screen.getByText(/\*\*bold\*\*/i)).toBeInTheDocument();
  });

  test('handles keyboard shortcuts', () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.focus(editor);
    
    // Ctrl+B for bold
    fireEvent.keyDown(editor, { key: 'b', ctrlKey: true });
    expect(editor.value).toContain('**');
  });

  test('auto-saves content to localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '# Auto-saved content' } });
    
    expect(setItemSpy).toHaveBeenCalledWith(
      expect.stringContaining('markdown'),
      '# Auto-saved content'
    );
  });

  test('restores content from localStorage', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockReturnValue('# Restored content');
    
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    expect(editor).toHaveValue('# Restored content');
  });

  test('handles syntax highlighting in code blocks', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { 
      target: { 
        value: '```javascript\nfunction hello() {\n  console.log("world");\n}\n```' 
      } 
    });
    
    await waitFor(() => {
      expect(screen.getByText('function')).toBeInTheDocument();
      expect(screen.getByText('hello')).toBeInTheDocument();
    });
  });

  test('handles strikethrough text', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '~~strikethrough~~' } });
    
    await waitFor(() => {
      const strikeElement = screen.getByText('strikethrough');
      expect(strikeElement.tagName).toBe('DEL');
    });
  });

  test('handles task lists', async () => {
    renderWithProviders(<MarkdownEditorPage />);
    
    const editor = screen.getByPlaceholderText(/write your markdown/i);
    fireEvent.change(editor, { target: { value: '- [x] Completed task\n- [ ] Incomplete task' } });
    
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });
  });
});