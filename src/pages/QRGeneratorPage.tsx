import React, { useState, useRef } from 'react';
import { QrCode, Download, Copy, RefreshCw, Smartphone } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import { checkRateLimit, qrGeneratorLimiter } from '../utils/rateLimiter';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS, LIMITS } from '../utils/constants';

const QRGeneratorPage: React.FC = () => {
  const [text, setText] = useState('https://braindead.site');
  const [qrSize, setQrSize] = useState(200);
  const [errorLevel, setErrorLevel] = useState('M');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [qrHistory, setQrHistory] = useLocalStorage<Array<{text: string, timestamp: string}>>(STORAGE_KEYS.qrHistory, []);
  const { showSuccess, showError } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      checkRateLimit(qrGeneratorLimiter, 'QR generation');
    } catch (error) {
      showError(error.message);
      return;
    }
    
    if (text.length > LIMITS.maxQRTextLength) {
      showError('Text too long', `QR code text must be less than ${LIMITS.maxQRTextLength} characters`);
      return;
    }

    try {
      // Generate QR code with proper library
      await QRCodeLib.toCanvas(canvas, text, {
        width: qrSize,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        },
        errorCorrectionLevel: errorLevel as 'L' | 'M' | 'Q' | 'H'
      });
      
      // Add to history
      const newEntry = {
        text: text,
        timestamp: new Date().toLocaleString()
      };
      setQrHistory(prev => [newEntry, ...prev.slice(0, LIMITS.maxHistoryItems - 1)]);
      
      trackToolUsage('qr-generator', 'generate', {
        textLength: text.length,
        size: qrSize,
        errorLevel
      });
      
      showSuccess('QR code generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      showError('Failed to generate QR code');
      // Fallback: draw error message on canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = qrSize;
        canvas.height = qrSize;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, qrSize, qrSize);
        ctx.fillStyle = foregroundColor;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Error generating QR code', qrSize / 2, qrSize / 2);
      }
    }
  };

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL();
    link.click();
    showSuccess('QR code downloaded');
  };

  const copyQRAsImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showSuccess('QR code copied to clipboard');
        }
      });
    } catch (err) {
      showError('Failed to copy QR code');
    }
  };

  React.useEffect(() => {
    generateQR();
  }, [text, qrSize, errorLevel, foregroundColor, backgroundColor]);

  const presetTexts = [
    'https://braindead.site',
    'Hello, World!',
    'mailto:hello@braindead.site',
    'tel:+1234567890',
    'WIFI:T:WPA;S:MyNetwork;P:password123;;'
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="QR Code Generator"
        description="Create custom QR codes for URLs, text, WiFi, and more. Customize colors, sizes, and error correction levels."
        canonical="/qr-generator"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6">
          <QrCode className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
          QR Code Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Create custom QR codes for URLs, text, WiFi, and more. 
          <span className="text-emerald-400"> Because typing is so last century!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* QR Generator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Content</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Text or URL</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text, URL, or any content..."
                  className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {presetTexts.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setText(preset)}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                    >
                      {preset.length > 30 ? preset.substring(0, 30) + '...' : preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customization */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Customization</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Size</label>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value={150}>Small (150px)</option>
                  <option value={200}>Medium (200px)</option>
                  <option value={300}>Large (300px)</option>
                  <option value={400}>Extra Large (400px)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Error Correction</label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="L">Low (~7%)</option>
                  <option value="M">Medium (~15%)</option>
                  <option value="Q">Quartile (~25%)</option>
                  <option value="H">High (~30%)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Foreground Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Background Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={generateQR}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-semibold text-white hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate QR</span>
              </button>
              <button
                onClick={downloadQR}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={copyQRAsImage}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* QR Preview & History */}
        <div className="space-y-6">
          {/* QR Preview */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Preview
            </h3>
            
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-2xl">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Scan with your phone camera</p>
              <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg p-2 font-mono break-all">
                {text.length > 50 ? text.substring(0, 50) + '...' : text}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent QR Codes</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {qrHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No QR codes generated yet.<br />
                  <span className="text-sm">Create your first QR code!</span>
                </p>
              ) : (
                qrHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => setText(entry.text)}
                  >
                    <div className="text-sm text-white font-mono break-all mb-1">
                      {entry.text.length > 40 ? entry.text.substring(0, 40) + '...' : entry.text}
                    </div>
                    <div className="text-xs text-gray-400">{entry.timestamp}</div>
                  </div>
                ))
              )}
            </div>
            {qrHistory.length > 0 && (
              <button
                onClick={() => setQrHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">📱 Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Higher error correction = more damage resistance</li>
              <li>• Keep URLs short for cleaner QR codes</li>
              <li>• Test QR codes before printing</li>
              <li>• Use high contrast colors for better scanning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGeneratorPage;