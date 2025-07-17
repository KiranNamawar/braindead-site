import React, { useState, useCallback, useEffect } from 'react';
import { FileText, Copy, Upload, Download, Eye, EyeOff, Split, Maximize2, Type, Bold, Italic, Link, List, ListOrdered, Quote, Code, Image } from 'lucide-react';
import BackButton from '../components/BackButton';
import { LIMITS } from '../utils/constants';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/github-dark.css';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);

const MarkdownEditorPage: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);

  // Configure marked
  useEffect(() => {
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {
            console.warn('Syntax highlighting failed:', err);
          }
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });
  }, []);

  const parseMarkdown = useCallback(async () => {
    if (!markdown.trim()) {
      setHtml('');
      setError('');
      return;
    }

    if (markdown.length > LIMITS.maxTextLength) {
      setError(`Markdown too large. Maximum size is ${LIMITS.maxTextLength / 1000}KB`);
      setHtml('');
      return;
    }

    try {
      const parsedHtml = await marked.parse(markdown);
      setHtml(parsedHtml);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse markdown');
      setHtml('');
    }
  }, [markdown]);

  const updateStats = useCallback(() => {
    const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
    const chars = markdown.length;
    const lines = markdown.split('\n').length;
    
    setWordCount(words);
    setCharCount(chars);
    setLineCount(lines);
  }, [markdown]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > LIMITS.maxFileSize) {
      setError(`File too large. Maximum size is ${LIMITS.maxFileSize / (1024 * 1024)}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setMarkdown(content);
    };
    reader.readAsText(file);
  }, []);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${type} copied!`);
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const replacement = selectedText || placeholder;
    
    const newText = markdown.substring(0, start) + before + replacement + after + markdown.substring(end);
    setMarkdown(newText);
    
    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('**', '**', 'bold text'), title: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*', 'italic text'), title: 'Italic' },
    { icon: Type, action: () => insertMarkdown('# ', '', 'Heading'), title: 'Heading' },
    { icon: Link, action: () => insertMarkdown('[', '](url)', 'link text'), title: 'Link' },
    { icon: Image, action: () => insertMarkdown('![', '](image-url)', 'alt text'), title: 'Image' },
    { icon: Code, action: () => insertMarkdown('`', '`', 'code'), title: 'Inline Code' },
    { icon: Quote, action: () => insertMarkdown('> ', '', 'quote'), title: 'Quote' },
    { icon: List, action: () => insertMarkdown('- ', '', 'list item'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertMarkdown('1. ', '', 'list item'), title: 'Numbered List' },
  ];

  const sampleMarkdown = `# Welcome to Markdown Editor

This is a **live markdown editor** with *real-time preview*. You can write markdown on the left and see the rendered HTML on the right.

## Features

- ✅ **Live Preview** - See changes instantly
- ✅ **Syntax Highlighting** - Code blocks are highlighted
- ✅ **Export Options** - Download as Markdown or HTML
- ✅ **Toolbar** - Quick formatting buttons
- ✅ **Statistics** - Word, character, and line counts

## Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item
  - Another nested item

### Ordered List
1. First item
2. Second item
3. Third item

## Links and Images

[Visit GitHub](https://github.com)

![Placeholder Image](https://via.placeholder.com/300x200?text=Markdown+Image)

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Editor | ✅ | Working |
| Preview | ✅ | Live |
| Export | ✅ | Multiple formats |

## Blockquotes

> This is a blockquote. It can span multiple lines and is great for highlighting important information or quotes from other sources.

---

**Happy writing!** 🚀`;

  useEffect(() => {
    const timer = setTimeout(() => {
      parseMarkdown();
      updateStats();
    }, 300);
    return () => clearTimeout(timer);
  }, [parseMarkdown, updateStats]);

  // Initialize with sample markdown
  useEffect(() => {
    if (!markdown) {
      setMarkdown(sampleMarkdown);
    }
  }, [markdown]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Markdown Editor
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Write and preview Markdown with live rendering, syntax highlighting, and export options.
          <span className="text-purple-400"> Write formatted text without the formatting headaches!</span>
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Mode Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'edit'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'split'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Split className="w-4 h-4" />
                <span>Split</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  viewMode === 'preview'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>

            {/* File Operations */}
            <input
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors cursor-pointer flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </label>
          </div>

          {/* Export and Copy */}
          <div className="flex items-center space-x-2">
            {copyFeedback && (
              <span className="text-green-400 text-sm">{copyFeedback}</span>
            )}
            <button
              onClick={() => copyToClipboard(markdown, 'Markdown')}
              disabled={!markdown}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <Copy className="w-4 h-4" />
              <span>Copy MD</span>
            </button>
            <button
              onClick={() => copyToClipboard(html, 'HTML')}
              disabled={!html}
              className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <Copy className="w-4 h-4" />
              <span>Copy HTML</span>
            </button>
            <button
              onClick={() => downloadFile(markdown, 'document.md', 'text/markdown')}
              disabled={!markdown}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>MD</span>
            </button>
            <button
              onClick={() => downloadFile(html, 'document.html', 'text/html')}
              disabled={!html}
              className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>HTML</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-700">
            {toolbarButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.action}
                title={button.title}
                className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <button.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
          <span>Words: <span className="text-white">{wordCount}</span></span>
          <span>Characters: <span className="text-white">{charCount}</span></span>
          <span>Lines: <span className="text-white">{lineCount}</span></span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg mb-8">
          <div className="text-red-400 text-sm font-semibold mb-1">Error:</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      )}

      {/* Editor and Preview */}
      <div className={`grid gap-8 ${
        viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Markdown Editor</h3>
            <textarea
              id="markdown-editor"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Start writing your markdown here..."
              className="w-full h-96 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-purple-500 focus:outline-none"
              style={{ minHeight: '600px' }}
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Live Preview</h3>
            <div 
              className="prose prose-invert prose-purple max-w-none h-96 overflow-y-auto p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
              style={{ minHeight: '600px' }}
              dangerouslySetInnerHTML={{ __html: html || '<p class="text-gray-400">Preview will appear here...</p>' }}
            />
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mt-8">
        <h4 className="text-lg font-semibold text-white mb-3">📝 Markdown Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <div className="font-semibold text-white mb-2">Basic Formatting:</div>
            <ul className="space-y-1">
              <li>• **bold** or __bold__</li>
              <li>• *italic* or _italic_</li>
              <li>• `inline code`</li>
              <li>• ~~strikethrough~~</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-2">Structure:</div>
            <ul className="space-y-1">
              <li>• # H1, ## H2, ### H3</li>
              <li>• - or * for bullet lists</li>
              <li>• 1. for numbered lists</li>
              <li>• &gt; for blockquotes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorPage;