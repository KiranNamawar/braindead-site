import React, { useState, useMemo } from 'react';
import { FileText, Copy, Download, BarChart3, List, Zap, Target } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { LIMITS } from '../utils/constants';

interface SentenceScore {
  sentence: string;
  score: number;
  position: number;
  wordCount: number;
}

interface KeyPhrase {
  phrase: string;
  frequency: number;
  score: number;
}

const TextSummarizerPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [summaryLength, setSummaryLength] = useState(3);
  const [summaryType, setSummaryType] = useState<'sentences' | 'percentage'>('sentences');
  const [summaryPercentage, setSummaryPercentage] = useState(30);
  const [outputFormat, setOutputFormat] = useState<'paragraph' | 'bullets' | 'numbered'>('paragraph');
  const [includeKeyPhrases, setIncludeKeyPhrases] = useState(true);
  
  const { copyToClipboard } = useClipboard();
  const { showSuccess, showError } = useToast();

  // Text preprocessing
  const preprocessText = (text: string): string => {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.!?]/g, '')
      .trim();
  };

  // Extract sentences
  const extractSentences = (text: string): string[] => {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && s.split(' ').length > 3);
  };

  // Calculate word frequency
  const calculateWordFrequency = (text: string): { [key: string]: number } => {
    const words = preprocessText(text)
      .toLowerCase()
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'].includes(word)
      );
    
    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return frequency;
  };

  // Score sentences based on word frequency and position
  const scoreSentences = (sentences: string[], wordFreq: { [key: string]: number }): SentenceScore[] => {
    const maxFreq = Math.max(...Object.values(wordFreq));
    
    return sentences.map((sentence, index) => {
      const words = preprocessText(sentence).toLowerCase().split(/\s+/);
      const wordCount = words.length;
      
      // Calculate frequency score
      let frequencyScore = 0;
      words.forEach(word => {
        if (wordFreq[word]) {
          frequencyScore += wordFreq[word] / maxFreq;
        }
      });
      frequencyScore = frequencyScore / wordCount;
      
      // Position score (earlier sentences get higher scores)
      const positionScore = (sentences.length - index) / sentences.length;
      
      // Length score (prefer medium-length sentences)
      const lengthScore = wordCount > 5 && wordCount < 30 ? 1 : 0.5;
      
      // Combined score
      const totalScore = (frequencyScore * 0.6) + (positionScore * 0.3) + (lengthScore * 0.1);
      
      return {
        sentence: sentence.trim(),
        score: totalScore,
        position: index,
        wordCount
      };
    });
  };

  // Extract key phrases
  const extractKeyPhrases = (text: string): KeyPhrase[] => {
    const words = preprocessText(text).toLowerCase().split(/\s+/);
    const phrases: { [key: string]: number } = {};
    
    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const twoWordPhrase = `${words[i]} ${words[i + 1]}`;
      if (words[i].length > 3 && words[i + 1].length > 3) {
        phrases[twoWordPhrase] = (phrases[twoWordPhrase] || 0) + 1;
      }
      
      if (i < words.length - 2) {
        const threeWordPhrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        if (words[i].length > 3 && words[i + 1].length > 3 && words[i + 2].length > 3) {
          phrases[threeWordPhrase] = (phrases[threeWordPhrase] || 0) + 1;
        }
      }
    }
    
    return Object.entries(phrases)
      .filter(([phrase, freq]) => freq > 1)
      .map(([phrase, freq]) => ({
        phrase,
        frequency: freq,
        score: freq * phrase.split(' ').length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  };

  // Generate summary
  const summary = useMemo(() => {
    if (!inputText.trim()) return null;
    
    const sentences = extractSentences(inputText);
    if (sentences.length === 0) return null;
    
    const wordFreq = calculateWordFrequency(inputText);
    const scoredSentences = scoreSentences(sentences, wordFreq);
    
    // Determine number of sentences to include
    let numSentences: number;
    if (summaryType === 'sentences') {
      numSentences = Math.min(summaryLength, sentences.length);
    } else {
      numSentences = Math.max(1, Math.floor(sentences.length * (summaryPercentage / 100)));
    }
    
    // Select top sentences and sort by original position
    const selectedSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .sort((a, b) => a.position - b.position);
    
    const keyPhrases = includeKeyPhrases ? extractKeyPhrases(inputText) : [];
    
    return {
      sentences: selectedSentences,
      keyPhrases,
      originalLength: sentences.length,
      summaryLength: numSentences,
      compressionRatio: Math.round((1 - numSentences / sentences.length) * 100)
    };
  }, [inputText, summaryLength, summaryType, summaryPercentage, includeKeyPhrases]);

  // Format summary output
  const formatSummary = (summary: any): string => {
    if (!summary) return '';
    
    const sentences = summary.sentences.map((s: SentenceScore) => s.sentence);
    
    switch (outputFormat) {
      case 'bullets':
        return sentences.map((s: string) => `• ${s}`).join('\n');
      case 'numbered':
        return sentences.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');
      default:
        return sentences.join(' ');
    }
  };

  const formattedSummary = summary ? formatSummary(summary) : '';

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

  const generateFullReport = (): string => {
    if (!summary) return '';
    
    return `Text Summary Report
Generated on: ${new Date().toLocaleString()}

Original Statistics:
- Total sentences: ${summary.originalLength}
- Summary sentences: ${summary.summaryLength}
- Compression ratio: ${summary.compressionRatio}%

Summary:
${formattedSummary}

${summary.keyPhrases.length > 0 ? `
Key Phrases:
${summary.keyPhrases.map((kp, i) => `${i + 1}. ${kp.phrase} (${kp.frequency} occurrences)`).join('\n')}
` : ''}

Original Text:
${inputText}`;
  };

  const handleDownload = () => {
    const report = generateFullReport();
    if (!report.trim()) {
      showError('Nothing to download');
      return;
    }

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Summary report downloaded successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Text Summarizer"
        description="Automatically summarize long text with extractive summarization, key phrase extraction, and customizable output formats. Perfect for research and content analysis!"
        canonical="/text-summarizer"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Text Summarizer
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Automatically extract key sentences and phrases from long text with intelligent summarization.
          <span className="text-indigo-400"> Because reading everything is overrated!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input and Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Input Text */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Input Text</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your long text here to summarize..."
              className="w-full h-64 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none focus:border-indigo-500 focus:outline-none text-sm"
              maxLength={LIMITS.maxTextLength}
            />
            <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
              <span>{inputText.length} / {LIMITS.maxTextLength} characters</span>
              <button
                onClick={() => setInputText('')}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Summary Settings */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Summary Settings</h3>
            
            {/* Summary Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Summary Length</label>
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setSummaryType('sentences')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    summaryType === 'sentences'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  Sentences
                </button>
                <button
                  onClick={() => setSummaryType('percentage')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    summaryType === 'percentage'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  Percentage
                </button>
              </div>
              
              {summaryType === 'sentences' ? (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Number of sentences: {summaryLength}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={summaryLength}
                    onChange={(e) => setSummaryLength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Percentage of original: {summaryPercentage}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={summaryPercentage}
                    onChange={(e) => setSummaryPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10%</span>
                    <span>80%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Output Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="paragraph">Paragraph</option>
                <option value="bullets">Bullet Points</option>
                <option value="numbered">Numbered List</option>
              </select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeKeyPhrases}
                  onChange={(e) => setIncludeKeyPhrases(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-300">Include key phrases</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Statistics */}
          {summary && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Summary Statistics</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-400">{summary.originalLength}</div>
                  <div className="text-gray-400 text-sm">Original Sentences</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{summary.summaryLength}</div>
                  <div className="text-gray-400 text-sm">Summary Sentences</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{summary.compressionRatio}%</div>
                  <div className="text-gray-400 text-sm">Compression</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{summary.keyPhrases.length}</div>
                  <div className="text-gray-400 text-sm">Key Phrases</div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Output */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Generated Summary</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCopy(formattedSummary, 'Summary')}
                  disabled={!formattedSummary.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!formattedSummary.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6">
              {formattedSummary ? (
                <pre className="text-sm text-white whitespace-pre-wrap break-words leading-relaxed">
                  {formattedSummary}
                </pre>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Enter text above to generate a summary</p>
                </div>
              )}
            </div>
          </div>

          {/* Key Phrases */}
          {summary && summary.keyPhrases.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <List className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Key Phrases</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {summary.keyPhrases.map((phrase: KeyPhrase, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                    <span className="text-white font-medium">{phrase.phrase}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 text-sm">{phrase.frequency}x</span>
                      <div className="w-12 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                          style={{ width: `${Math.min((phrase.score / Math.max(...summary.keyPhrases.map((p: KeyPhrase) => p.score))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">✨ Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Longer texts produce better summaries</li>
              <li>• Use percentage mode for consistent compression</li>
              <li>• Key phrases help identify main topics</li>
              <li>• Bullet format is great for presentations</li>
              <li>• Try different lengths to find the sweet spot</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextSummarizerPage;