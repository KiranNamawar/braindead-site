import React, { useState, useMemo } from 'react';
import { FileText, Copy, Clock, BarChart3, Hash, Eye, BookOpen } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { LIMITS } from '../utils/constants';

interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: number;
  speakingTime: number;
  averageWordsPerSentence: number;
  averageCharactersPerWord: number;
  longestWord: string;
  shortestWord: string;
}

interface KeywordDensity {
  word: string;
  count: number;
  density: number;
}

const WordCounterPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const { copyToClipboard } = useClipboard();
  const { showSuccess, showError } = useToast();

  const handleCopy = async (text: string) => {
    if (!text.trim()) {
      showError('Nothing to copy');
      return;
    }
    
    const success = await copyToClipboard(text);
    if (success) {
      showSuccess('Statistics copied to clipboard');
    } else {
      showError('Failed to copy statistics');
    }
  };

  const textStats: TextStats = useMemo(() => {
    if (!inputText.trim()) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        readingTime: 0,
        speakingTime: 0,
        averageWordsPerSentence: 0,
        averageCharactersPerWord: 0,
        longestWord: '',
        shortestWord: ''
      };
    }

    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const lines = inputText.split('\n').length;
    
    // Reading time calculation (average 200 words per minute)
    const readingTime = Math.ceil(words.length / 200);
    
    // Speaking time calculation (average 150 words per minute)
    const speakingTime = Math.ceil(words.length / 150);
    
    const averageWordsPerSentence = sentences > 0 ? Math.round((words.length / sentences) * 10) / 10 : 0;
    const averageCharactersPerWord = words.length > 0 ? Math.round((charactersNoSpaces / words.length) * 10) / 10 : 0;
    
    const cleanWords = words.map(word => word.replace(/[^\w]/g, '').toLowerCase()).filter(word => word.length > 0);
    const longestWord = cleanWords.reduce((longest, current) => current.length > longest.length ? current : longest, '');
    const shortestWord = cleanWords.reduce((shortest, current) => current.length < shortest.length ? current : shortest, cleanWords[0] || '');

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime,
      averageWordsPerSentence,
      averageCharactersPerWord,
      longestWord,
      shortestWord
    };
  }, [inputText]);

  const keywordDensity: KeywordDensity[] = useMemo(() => {
    if (!inputText.trim()) return [];

    const words = inputText.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out words shorter than 3 characters

    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const totalWords = words.length;
    
    return Object.entries(wordCount)
      .map(([word, count]) => ({
        word,
        count,
        density: Math.round((count / totalWords) * 10000) / 100 // Percentage with 2 decimal places
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 keywords
  }, [inputText]);

  const formatStatsForCopy = () => {
    return `Text Statistics:
Words: ${textStats.words}
Characters: ${textStats.characters}
Characters (no spaces): ${textStats.charactersNoSpaces}
Sentences: ${textStats.sentences}
Paragraphs: ${textStats.paragraphs}
Lines: ${textStats.lines}
Reading time: ${textStats.readingTime} minute${textStats.readingTime !== 1 ? 's' : ''}
Speaking time: ${textStats.speakingTime} minute${textStats.speakingTime !== 1 ? 's' : ''}
Average words per sentence: ${textStats.averageWordsPerSentence}
Average characters per word: ${textStats.averageCharactersPerWord}
Longest word: ${textStats.longestWord}
Shortest word: ${textStats.shortestWord}

Top Keywords:
${keywordDensity.slice(0, 10).map((kw, i) => `${i + 1}. ${kw.word} (${kw.count} times, ${kw.density}%)`).join('\n')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Word Counter & Text Analyzer"
        description="Comprehensive text analysis tool with word count, character count, reading time estimation, and keyword density analysis. No signup required!"
        canonical="/word-counter"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Word Counter & Text Analyzer
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Comprehensive text analysis with reading time, keyword density, and detailed statistics.
          <span className="text-blue-400"> Because counting words manually is medieval!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Input Text</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your text here to analyze..."
              className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none focus:border-blue-500 focus:outline-none text-sm md:text-base"
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

          {/* Quick Stats */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{textStats.words}</div>
                <div className="text-gray-400 text-sm">Words</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{textStats.characters}</div>
                <div className="text-gray-400 text-sm">Characters</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{textStats.sentences}</div>
                <div className="text-gray-400 text-sm">Sentences</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{textStats.paragraphs}</div>
                <div className="text-gray-400 text-sm">Paragraphs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="space-y-6">
          {/* Reading Time */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Reading & Speaking Time</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">Reading</span>
                </div>
                <div className="text-2xl font-bold text-white">{textStats.readingTime}</div>
                <div className="text-gray-400 text-sm">minute{textStats.readingTime !== 1 ? 's' : ''}</div>
                <div className="text-xs text-gray-500 mt-1">~200 WPM</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-semibold">Speaking</span>
                </div>
                <div className="text-2xl font-bold text-white">{textStats.speakingTime}</div>
                <div className="text-gray-400 text-sm">minute{textStats.speakingTime !== 1 ? 's' : ''}</div>
                <div className="text-xs text-gray-500 mt-1">~150 WPM</div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Detailed Statistics</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Characters (no spaces):</span>
                    <span className="text-white font-semibold">{textStats.charactersNoSpaces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lines:</span>
                    <span className="text-white font-semibold">{textStats.lines}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg words/sentence:</span>
                    <span className="text-white font-semibold">{textStats.averageWordsPerSentence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg chars/word:</span>
                    <span className="text-white font-semibold">{textStats.averageCharactersPerWord}</span>
                  </div>
                </div>
              </div>
              
              {textStats.longestWord && (
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Longest word:</span>
                      <span className="text-white font-semibold">{textStats.longestWord}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shortest word:</span>
                      <span className="text-white font-semibold">{textStats.shortestWord}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Keyword Density */}
          {keywordDensity.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Hash className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Keyword Density</h3>
                </div>
                <button
                  onClick={() => handleCopy(formatStatsForCopy())}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Stats</span>
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {keywordDensity.slice(0, 15).map((keyword, index) => (
                  <div key={keyword.word} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
                      <span className="text-white font-medium">{keyword.word}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-yellow-400 font-semibold">{keyword.count}</span>
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full"
                          style={{ width: `${Math.min(keyword.density * 10, 100)}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-12">{keyword.density}%</span>
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
              <li>• Aim for 15-20 words per sentence for readability</li>
              <li>• Reading time helps estimate content consumption</li>
              <li>• High keyword density may indicate repetition</li>
              <li>• Use statistics to optimize your writing style</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCounterPage;