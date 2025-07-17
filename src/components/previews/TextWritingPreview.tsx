import React, { useState, useEffect } from 'react';
import { FileText, Type } from 'lucide-react';

interface TextWritingPreviewProps {
  isActive: boolean;
}

const TextWritingPreview: React.FC<TextWritingPreviewProps> = ({ isActive }) => {
  const [text, setText] = useState("Transform your text without the Microsoft Word subscription! This live preview shows word count, character analysis, and reading time estimation.");
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0
  });

  useEffect(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime
    });
  }, [text]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-amber-400" />
        <span className="text-white font-medium">Text Analyzer Preview</span>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">Enter your text:</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-24 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors resize-none"
          placeholder="Start typing to see live analysis..."
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-amber-400 font-bold text-lg">{stats.words}</div>
          <div className="text-gray-400 text-xs">Words</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-blue-400 font-bold text-lg">{stats.characters}</div>
          <div className="text-gray-400 text-xs">Characters</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-green-400 font-bold text-lg">{stats.sentences}</div>
          <div className="text-gray-400 text-xs">Sentences</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-purple-400 font-bold text-lg">{stats.paragraphs}</div>
          <div className="text-gray-400 text-xs">Paragraphs</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-pink-400 font-bold text-lg">{stats.charactersNoSpaces}</div>
          <div className="text-gray-400 text-xs">No Spaces</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/50">
          <div className="text-cyan-400 font-bold text-lg">{stats.readingTime}m</div>
          <div className="text-gray-400 text-xs">Read Time</div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Type className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Live Analysis</span>
        </div>
        <div className="text-xs text-gray-500">
          {stats.words > 0 ? `${(stats.characters / stats.words).toFixed(1)} chars/word` : 'Start typing...'}
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 italic">
          "Count words because apparently that matters"
        </p>
      </div>
    </div>
  );
};

export default TextWritingPreview;