import React, { useState, useMemo } from 'react';
import { GitCompare, Copy, Download, Eye, RotateCcw, FileText } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { LIMITS } from '../utils/constants';
import { sanitizeText } from '../utils/security';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
  oldContent?: string;
  newContent?: string;
}

interface WordDiff {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

const DiffCheckerPage: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [diffMode, setDiffMode] = useState<'line' | 'word' | 'character'>('line');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [sideBySide, setSideBySide] = useState(true);
  
  const { copyToClipboard } = useClipboard();
  const { showSuccess, showError } = useToast();

  const preprocessText = (text: string): string => {
    let processed = text;
    if (ignoreCase) {
      processed = processed.toLowerCase();
    }
    if (ignoreWhitespace) {
      processed = processed.replace(/\s+/g, ' ').trim();
    }
    return processed;
  };

  const lineDiff = useMemo(() => {
    const originalLines = originalText.split('\n');
    const modifiedLines = modifiedText.split('\n');
    
    const processedOriginal = originalLines.map(preprocessText);
    const processedModified = modifiedLines.map(preprocessText);
    
    const diff: DiffLine[] = [];
    let originalIndex = 0;
    let modifiedIndex = 0;
    
    // Simple diff algorithm - can be enhanced with more sophisticated algorithms
    while (originalIndex < processedOriginal.length || modifiedIndex < processedModified.length) {
      const originalLine = processedOriginal[originalIndex];
      const modifiedLine = processedModified[modifiedIndex];
      
      if (originalIndex >= processedOriginal.length) {
        // Only modified lines left
        diff.push({
          type: 'added',
          newLineNumber: modifiedIndex + 1,
          content: modifiedLines[modifiedIndex]
        });
        modifiedIndex++;
      } else if (modifiedIndex >= processedModified.length) {
        // Only original lines left
        diff.push({
          type: 'removed',
          oldLineNumber: originalIndex + 1,
          content: originalLines[originalIndex]
        });
        originalIndex++;
      } else if (originalLine === modifiedLine) {
        // Lines are the same
        diff.push({
          type: 'unchanged',
          oldLineNumber: originalIndex + 1,
          newLineNumber: modifiedIndex + 1,
          content: originalLines[originalIndex]
        });
        originalIndex++;
        modifiedIndex++;
      } else {
        // Lines are different - check if it's a modification or addition/removal
        const nextOriginalMatch = processedOriginal.slice(originalIndex + 1).findIndex(line => line === modifiedLine);
        const nextModifiedMatch = processedModified.slice(modifiedIndex + 1).findIndex(line => line === originalLine);
        
        if (nextOriginalMatch !== -1 && (nextModifiedMatch === -1 || nextOriginalMatch <= nextModifiedMatch)) {
          // Original line was removed
          diff.push({
            type: 'removed',
            oldLineNumber: originalIndex + 1,
            content: originalLines[originalIndex]
          });
          originalIndex++;
        } else if (nextModifiedMatch !== -1) {
          // New line was added
          diff.push({
            type: 'added',
            newLineNumber: modifiedIndex + 1,
            content: modifiedLines[modifiedIndex]
          });
          modifiedIndex++;
        } else {
          // Lines are modified
          diff.push({
            type: 'modified',
            oldLineNumber: originalIndex + 1,
            newLineNumber: modifiedIndex + 1,
            content: modifiedLines[modifiedIndex],
            oldContent: originalLines[originalIndex],
            newContent: modifiedLines[modifiedIndex]
          });
          originalIndex++;
          modifiedIndex++;
        }
      }
    }
    
    return diff;
  }, [originalText, modifiedText, ignoreWhitespace, ignoreCase]);

  const wordDiff = useMemo(() => {
    const originalWords = preprocessText(originalText).split(/\s+/).filter(w => w);
    const modifiedWords = preprocessText(modifiedText).split(/\s+/).filter(w => w);
    
    const diff: WordDiff[] = [];
    let originalIndex = 0;
    let modifiedIndex = 0;
    
    while (originalIndex < originalWords.length || modifiedIndex < modifiedWords.length) {
      const originalWord = originalWords[originalIndex];
      const modifiedWord = modifiedWords[modifiedIndex];
      
      if (originalIndex >= originalWords.length) {
        diff.push({ type: 'added', content: modifiedWord });
        modifiedIndex++;
      } else if (modifiedIndex >= modifiedWords.length) {
        diff.push({ type: 'removed', content: originalWord });
        originalIndex++;
      } else if (originalWord === modifiedWord) {
        diff.push({ type: 'unchanged', content: originalWord });
        originalIndex++;
        modifiedIndex++;
      } else {
        // Check for word replacements
        const nextOriginalMatch = originalWords.slice(originalIndex + 1).findIndex(word => word === modifiedWord);
        const nextModifiedMatch = modifiedWords.slice(modifiedIndex + 1).findIndex(word => word === originalWord);
        
        if (nextOriginalMatch !== -1 && (nextModifiedMatch === -1 || nextOriginalMatch <= nextModifiedMatch)) {
          diff.push({ type: 'removed', content: originalWord });
          originalIndex++;
        } else if (nextModifiedMatch !== -1) {
          diff.push({ type: 'added', content: modifiedWord });
          modifiedIndex++;
        } else {
          diff.push({ type: 'removed', content: originalWord });
          diff.push({ type: 'added', content: modifiedWord });
          originalIndex++;
          modifiedIndex++;
        }
      }
    }
    
    return diff;
  }, [originalText, modifiedText, ignoreWhitespace, ignoreCase]);

  const characterDiff = useMemo(() => {
    const originalChars = preprocessText(originalText).split('');
    const modifiedChars = preprocessText(modifiedText).split('');
    
    const diff: WordDiff[] = [];
    let originalIndex = 0;
    let modifiedIndex = 0;
    
    while (originalIndex < originalChars.length || modifiedIndex < modifiedChars.length) {
      const originalChar = originalChars[originalIndex];
      const modifiedChar = modifiedChars[modifiedIndex];
      
      if (originalIndex >= originalChars.length) {
        diff.push({ type: 'added', content: modifiedChar });
        modifiedIndex++;
      } else if (modifiedIndex >= modifiedChars.length) {
        diff.push({ type: 'removed', content: originalChar });
        originalIndex++;
      } else if (originalChar === modifiedChar) {
        diff.push({ type: 'unchanged', content: originalChar });
        originalIndex++;
        modifiedIndex++;
      } else {
        diff.push({ type: 'removed', content: originalChar });
        diff.push({ type: 'added', content: modifiedChar });
        originalIndex++;
        modifiedIndex++;
      }
    }
    
    return diff;
  }, [originalText, modifiedText, ignoreWhitespace, ignoreCase]);

  const stats = useMemo(() => {
    const added = lineDiff.filter(line => line.type === 'added').length;
    const removed = lineDiff.filter(line => line.type === 'removed').length;
    const modified = lineDiff.filter(line => line.type === 'modified').length;
    const unchanged = lineDiff.filter(line => line.type === 'unchanged').length;
    
    return { added, removed, modified, unchanged, total: lineDiff.length };
  }, [lineDiff]);

  const handleCopy = async (content: string, label: string) => {
    if (!content.trim()) {
      showError('Nothing to copy');
      return;
    }
    
    const success = await copyToClipboard(content);
    if (success) {
      showSuccess(`${label} copied to clipboard`);
    } else {
      showError('Failed to copy content');
    }
  };

  const generateDiffReport = () => {
    const report = `Diff Report
Generated on: ${new Date().toLocaleString()}

Statistics:
- Added lines: ${stats.added}
- Removed lines: ${stats.removed}
- Modified lines: ${stats.modified}
- Unchanged lines: ${stats.unchanged}
- Total lines: ${stats.total}

Settings:
- Diff mode: ${diffMode}
- Ignore whitespace: ${ignoreWhitespace ? 'Yes' : 'No'}
- Ignore case: ${ignoreCase ? 'Yes' : 'No'}

Line-by-line diff:
${lineDiff.map(line => {
  const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : line.type === 'modified' ? '~ ' : '  ';
  const lineNum = line.type === 'added' ? `(${line.newLineNumber})` : line.type === 'removed' ? `(${line.oldLineNumber})` : `(${line.oldLineNumber})`;
  return `${prefix}${lineNum} ${line.content}`;
}).join('\n')}`;

    return report;
  };

  const handleDownload = () => {
    const report = generateDiffReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Diff report downloaded successfully');
  };

  const swapTexts = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
    showSuccess('Texts swapped');
  };

  const clearTexts = () => {
    setOriginalText('');
    setModifiedText('');
    showSuccess('Texts cleared');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Diff Checker"
        description="Compare text differences with side-by-side view, line-by-line highlighting, and export functionality. Perfect for code reviews and document comparison!"
        canonical="/diff-checker"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6">
          <GitCompare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
          Diff Checker
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Compare text differences with advanced highlighting and export options.
          <span className="text-orange-400"> Because spotting changes manually is torture!</span>
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Diff Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Diff Mode</label>
              <select
                value={diffMode}
                onChange={(e) => setDiffMode(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="line">Line by Line</option>
                <option value="word">Word by Word</option>
                <option value="character">Character by Character</option>
              </select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <span className="text-gray-300 text-sm">Ignore whitespace</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <span className="text-gray-300 text-sm">Ignore case</span>
              </label>
            </div>

            {/* Display Options */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <span className="text-gray-300 text-sm">Show line numbers</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sideBySide}
                  onChange={(e) => setSideBySide(e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <span className="text-gray-300 text-sm">Side by side</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={swapTexts}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Swap</span>
              </button>
              <button
                onClick={clearTexts}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className={`grid gap-8 mb-8 ${sideBySide ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Original Text</h3>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(sanitizeText(e.target.value))}
            placeholder="Paste your original text here..."
            className="w-full h-64 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none focus:border-orange-500 focus:outline-none text-sm font-mono"
            maxLength={LIMITS.maxTextLength}
          />
          <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
            <span>{originalText.length} characters</span>
            <button
              onClick={() => handleCopy(originalText, 'Original text')}
              disabled={!originalText.trim()}
              className="flex items-center space-x-2 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Modified Text</h3>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(sanitizeText(e.target.value))}
            placeholder="Paste your modified text here..."
            className="w-full h-64 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none focus:border-orange-500 focus:outline-none text-sm font-mono"
            maxLength={LIMITS.maxTextLength}
          />
          <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
            <span>{modifiedText.length} characters</span>
            <button
              onClick={() => handleCopy(modifiedText, 'Modified text')}
              disabled={!modifiedText.trim()}
              className="flex items-center space-x-2 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {(originalText.trim() || modifiedText.trim()) && (
        <div className="mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Diff Statistics</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCopy(generateDiffReport(), 'Diff report')}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Report</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.added}</div>
                <div className="text-green-300 text-sm">Added</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{stats.removed}</div>
                <div className="text-red-300 text-sm">Removed</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.modified}</div>
                <div className="text-yellow-300 text-sm">Modified</div>
              </div>
              <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-400">{stats.unchanged}</div>
                <div className="text-gray-300 text-sm">Unchanged</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                <div className="text-blue-300 text-sm">Total</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diff Results */}
      {(originalText.trim() || modifiedText.trim()) && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">
            {diffMode === 'line' ? 'Line Differences' : diffMode === 'word' ? 'Word Differences' : 'Character Differences'}
          </h3>
          
          <div className="bg-gray-800/50 rounded-xl p-6 max-h-96 overflow-y-auto">
            {diffMode === 'line' ? (
              <div className="space-y-1 font-mono text-sm">
                {lineDiff.map((line, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 px-3 py-1 rounded ${
                      line.type === 'added'
                        ? 'bg-green-500/10 border-l-4 border-green-500'
                        : line.type === 'removed'
                        ? 'bg-red-500/10 border-l-4 border-red-500'
                        : line.type === 'modified'
                        ? 'bg-yellow-500/10 border-l-4 border-yellow-500'
                        : 'bg-gray-700/20'
                    }`}
                  >
                    {showLineNumbers && (
                      <div className="flex space-x-2 text-gray-500 min-w-16">
                        <span className="w-8 text-right">{line.oldLineNumber || ''}</span>
                        <span className="w-8 text-right">{line.newLineNumber || ''}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <span
                        className={
                          line.type === 'added'
                            ? 'text-green-300'
                            : line.type === 'removed'
                            ? 'text-red-300'
                            : line.type === 'modified'
                            ? 'text-yellow-300'
                            : 'text-gray-300'
                        }
                      >
                        {line.type === 'added' && '+ '}
                        {line.type === 'removed' && '- '}
                        {line.type === 'modified' && '~ '}
                        {line.content}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-mono text-sm leading-relaxed">
                {(diffMode === 'word' ? wordDiff : characterDiff).map((item, index) => (
                  <span
                    key={index}
                    className={
                      item.type === 'added'
                        ? 'bg-green-500/20 text-green-300 px-1 rounded'
                        : item.type === 'removed'
                        ? 'bg-red-500/20 text-red-300 px-1 rounded line-through'
                        : 'text-gray-300'
                    }
                  >
                    {item.content}
                    {diffMode === 'word' && item.type !== 'removed' && ' '}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-3">✨ Pro Tips</h4>
        <ul className="text-sm text-gray-400 space-y-2">
          <li>• Use line mode for code and document comparison</li>
          <li>• Word mode is great for prose and content changes</li>
          <li>• Character mode shows the most detailed differences</li>
          <li>• Ignore whitespace for cleaner code comparisons</li>
          <li>• Export reports for documentation and reviews</li>
        </ul>
      </div>
    </div>
  );
};

export default DiffCheckerPage;