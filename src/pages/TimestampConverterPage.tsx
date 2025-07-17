import React, { useState, useEffect } from 'react';
import { Clock, Copy, RefreshCw, Calendar, Globe } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useToast } from '../components/ToastContainer';
import SEOHead from '../components/SEOHead';

const TimestampConverterPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [timestamp, setTimestamp] = useState('');
  const [humanDate, setHumanDate] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [format, setFormat] = useState('iso');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copyFeedback, setCopyFeedback] = useState('');
  const [conversionHistory, setConversionHistory] = useState<Array<{timestamp: string, human: string, timezone: string, time: string}>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const convertTimestampToHuman = () => {
    if (!timestamp) return;
    
    try {
      const ts = parseInt(timestamp);
      const date = new Date(ts * (timestamp.length === 10 ? 1000 : 1));
      
      let formatted = '';
      switch (format) {
        case 'iso':
          formatted = date.toISOString();
          break;
        case 'local':
          formatted = date.toLocaleString();
          break;
        case 'utc':
          formatted = date.toUTCString();
          break;
        case 'custom':
          formatted = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
          break;
        default:
          formatted = date.toString();
      }
      
      setHumanDate(formatted);
      
      // Add to history
      const historyEntry = {
        timestamp,
        human: formatted,
        timezone,
        time: new Date().toLocaleTimeString()
      };
      setConversionHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    } catch (error) {
      setHumanDate('Invalid timestamp');
    }
  };

  const convertHumanToTimestamp = () => {
    if (!humanDate) return;
    
    try {
      const date = new Date(humanDate);
      const ts = Math.floor(date.getTime() / 1000);
      setTimestamp(ts.toString());
      
      // Add to history
      const historyEntry = {
        timestamp: ts.toString(),
        human: humanDate,
        timezone,
        time: new Date().toLocaleTimeString()
      };
      setConversionHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    } catch (error) {
      setTimestamp('Invalid date');
    }
  };

  const getCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now.toString());
  };

  const getCurrentHuman = () => {
    const now = new Date();
    let formatted = '';
    switch (format) {
      case 'iso':
        formatted = now.toISOString();
        break;
      case 'local':
        formatted = now.toLocaleString();
        break;
      case 'utc':
        formatted = now.toUTCString();
        break;
      case 'custom':
        formatted = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        break;
      default:
        formatted = now.toString();
    }
    setHumanDate(formatted);
  };

  const timezones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
  ];

  const formats = [
    { value: 'iso', label: 'ISO 8601' },
    { value: 'local', label: 'Local Format' },
    { value: 'utc', label: 'UTC String' },
    { value: 'custom', label: 'Custom Format' }
  ];

  const presetTimestamps = [
    { label: 'Now', value: Math.floor(Date.now() / 1000).toString() },
    { label: 'Unix Epoch', value: '0' },
    { label: 'Y2K', value: '946684800' },
    { label: 'One week ago', value: Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000).toString() },
    { label: 'One month ago', value: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000).toString() }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Timestamp Converter"
        description="Convert between Unix timestamps and human-readable dates across timezones."
        canonical="/timestamp-converter"
      />
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-2xl mb-6">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          Timestamp Converter
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Convert between Unix timestamps and human-readable dates across timezones. 
          <span className="text-indigo-400"> Because time is relative, but deadlines aren't!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Converters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Time Display */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Current Time
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-2xl p-6 text-center">
                <div className="text-gray-400 text-sm mb-2">Unix Timestamp</div>
                <div className="text-2xl font-mono text-indigo-400 mb-3">
                  {Math.floor(currentTime.getTime() / 1000)}
                </div>
                <button
                  onClick={() => copyToClipboard(Math.floor(currentTime.getTime() / 1000).toString())}
                  className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-indigo-400 text-sm transition-colors"
                >
                  <Copy className="w-4 h-4 inline mr-1" />
                  Copy
                </button>
              </div>
              
              <div className="bg-gray-800/50 rounded-2xl p-6 text-center">
                <div className="text-gray-400 text-sm mb-2">Human Readable</div>
                <div className="text-lg text-cyan-400 mb-3">
                  {currentTime.toLocaleString()}
                </div>
                <button
                  onClick={() => copyToClipboard(currentTime.toLocaleString())}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm transition-colors"
                >
                  <Copy className="w-4 h-4 inline mr-1" />
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Timestamp to Human */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Timestamp to Human</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Unix Timestamp</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="1640995200"
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={getCurrentTimestamp}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {formats.map(fmt => (
                      <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={convertTimestampToHuman}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-600 rounded-xl font-semibold text-white hover:from-indigo-400 hover:to-cyan-500 transition-all duration-300"
              >
                Convert to Human
              </button>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Result</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={humanDate}
                    readOnly
                    placeholder="Human readable date will appear here..."
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(humanDate)}
                    disabled={!humanDate}
                    className="px-4 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Human to Timestamp */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Human to Timestamp</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Human Readable Date</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={humanDate}
                    onChange={(e) => setHumanDate(e.target.value)}
                    placeholder="2024-01-01 12:00:00 or January 1, 2024"
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    onClick={getCurrentHuman}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={convertHumanToTimestamp}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl font-semibold text-white hover:from-cyan-400 hover:to-indigo-500 transition-all duration-300"
              >
                Convert to Timestamp
              </button>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Result</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={timestamp}
                    readOnly
                    placeholder="Unix timestamp will appear here..."
                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(timestamp)}
                    disabled={!timestamp}
                    className="px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Presets & History */}
        <div className="space-y-6">
          {/* Copy Feedback */}
          {copyFeedback && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
              <div className="text-green-400 text-center font-semibold">
                {copyFeedback}
              </div>
            </div>
          )}

          {/* Preset Timestamps */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Presets</h3>
            <div className="space-y-2">
              {presetTimestamps.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setTimestamp(preset.value)}
                  className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors"
                >
                  <div className="font-semibold text-sm">{preset.label}</div>
                  <div className="text-gray-400 text-xs font-mono">{preset.value}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversion History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Conversions</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {conversionHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No conversions yet.<br />
                  <span className="text-sm">Start converting timestamps!</span>
                </p>
              ) : (
                conversionHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setTimestamp(entry.timestamp);
                      setHumanDate(entry.human);
                    }}
                  >
                    <div className="text-xs text-gray-400 mb-1">{entry.time}</div>
                    <div className="font-mono text-sm text-indigo-400 mb-1">{entry.timestamp}</div>
                    <div className="text-sm text-cyan-400 break-all">{entry.human}</div>
                  </div>
                ))
              )}
            </div>
            {conversionHistory.length > 0 && (
              <button
                onClick={() => setConversionHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">⏰ Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Unix timestamp is seconds since Jan 1, 1970</li>
              <li>• JavaScript uses milliseconds (divide by 1000)</li>
              <li>• Always consider timezone when converting</li>
              <li>• ISO 8601 format is universally supported</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverterPage;