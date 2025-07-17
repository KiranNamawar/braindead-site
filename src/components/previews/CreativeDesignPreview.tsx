import React, { useState, useEffect } from 'react';
import { Palette, Copy, RefreshCw } from 'lucide-react';

interface CreativeDesignPreviewProps {
  isActive: boolean;
}

const CreativeDesignPreview: React.FC<CreativeDesignPreviewProps> = ({ isActive }) => {
  const [color1, setColor1] = useState('#3b82f6');
  const [color2, setColor2] = useState('#8b5cf6');
  const [direction, setDirection] = useState(135);
  const [cssCode, setCssCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const css = `background: linear-gradient(${direction}deg, ${color1}, ${color2});`;
    setCssCode(css);
  }, [color1, color2, direction]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const randomizeColors = () => {
    const colors = [
      '#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', 
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    setColor1(colors[Math.floor(Math.random() * colors.length)]);
    setColor2(colors[Math.floor(Math.random() * colors.length)]);
    setDirection(Math.floor(Math.random() * 360));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-pink-400" />
          <span className="text-white font-medium">CSS Gradient Generator</span>
        </div>
        <button
          onClick={randomizeColors}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          title="Randomize"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      {/* Gradient Preview */}
      <div 
        className="h-32 rounded-xl border border-gray-700 shadow-lg transition-all duration-300"
        style={{
          background: `linear-gradient(${direction}deg, ${color1}, ${color2})`
        }}
      />

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Color 1</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer"
            />
            <input
              type="text"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Color 2</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer"
            />
            <input
              type="text"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Direction</label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="360"
              value={direction}
              onChange={(e) => setDirection(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center text-sm text-pink-400 font-medium">{direction}°</div>
          </div>
        </div>
      </div>

      {/* CSS Output */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">CSS Code:</span>
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <code className="text-sm text-green-400 font-mono break-all">
          {cssCode}
        </code>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 italic">
          "Beautiful gradients without the design degree"
        </p>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default CreativeDesignPreview;