import React, { useState, useEffect } from 'react';
import { Lock, Copy, RefreshCw, Shield, Eye, EyeOff } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import { checkRateLimit, passwordGeneratorLimiter } from '../utils/rateLimiter';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS, LIMITS } from '../utils/constants';
import { validatePasswordStrength } from '../utils/validation';

const PasswordGeneratorPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [passwordHistory, setPasswordHistory] = useLocalStorage<Array<{ password: string, strength: number, timestamp: string }>>(STORAGE_KEYS.passwordHistory, []);
  const { copyToClipboard, isCopied } = useClipboard();
  const { showSuccess, showError, showWarning } = useToast();
  const [showPassword, setShowPassword] = useState(true);

  const generatePassword = () => {
    try {
      checkRateLimit(passwordGeneratorLimiter, 'password generation');
    } catch (error) {
      showError(error.message);
      return;
    }

    if (length > LIMITS.maxPasswordLength) {
      showError('Password too long', `Maximum length is ${LIMITS.maxPasswordLength} characters`);
      return;
    }

    let charset = '';

    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }

    if (!charset) {
      setPassword('Please select at least one character type');
      showWarning('Please select at least one character type');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(newPassword);

    // Add to history
    const strength = calculateStrength(newPassword);
    const historyEntry = {
      password: newPassword,
      strength,
      timestamp: new Date().toLocaleString()
    };
    setPasswordHistory(prev => [historyEntry, ...prev.slice(0, LIMITS.maxHistoryItems - 1)]);

    trackToolUsage('password-generator', 'generate', {
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      strength
    });
  };

  const calculateStrength = (pwd: string): number => {
    const { score } = validatePasswordStrength(pwd);
    return score;
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return 'text-red-400';
    if (strength < 60) return 'text-yellow-400';
    if (strength < 80) return 'text-blue-400';
    return 'text-green-400';
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      showSuccess('Password copied!', 'Keep it safe and secure');
    } else {
      showError('Failed to copy password');
    }
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar]);

  const currentStrength = password ? calculateStrength(password) : 0;

  const presets = [
    { name: 'Basic', length: 12, upper: true, lower: true, numbers: true, symbols: false },
    { name: 'Strong', length: 16, upper: true, lower: true, numbers: true, symbols: true },
    { name: 'Ultra Secure', length: 24, upper: true, lower: true, numbers: true, symbols: true },
    { name: 'PIN Code', length: 6, upper: false, lower: false, numbers: true, symbols: false },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setLength(preset.length);
    setIncludeUppercase(preset.upper);
    setIncludeLowercase(preset.lower);
    setIncludeNumbers(preset.numbers);
    setIncludeSymbols(preset.symbols);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead
        title="Password Generator"
        description="Generate secure passwords with customizable options and strength analysis. Create unbreakable passwords in seconds."
        canonical="/password-generator"
      />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-6">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
          Password Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Generate secure passwords that even hackers would respect.
          <span className="text-purple-400"> Because "password123" isn't cutting it anymore!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Generated Password */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Generated Password</h3>
            </div>

            <div className="relative mb-6">
              {/* Password Display - Full Width */}
              <div className="relative mb-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  readOnly
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm md:text-lg focus:border-purple-500 focus:outline-none pr-12"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>

              {/* Action Buttons - Full Width on Mobile */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleCopy(password)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-400 transition-colors"
                >
                  <Copy className="w-5 h-5" />
                  <span className="font-medium">{isCopied ? 'Copied!' : 'Copy Password'}</span>
                </button>
                <button
                  onClick={generatePassword}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white hover:from-purple-400 hover:to-indigo-500 transition-all duration-300"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="font-medium">Generate New</span>
                </button>
              </div>
            </div>

            {/* Strength Meter */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Password Strength</span>
                <span className={`text-sm font-semibold ${getStrengthColor(currentStrength)}`}>
                  {getStrengthLabel(currentStrength)} ({currentStrength}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${currentStrength < 30 ? 'bg-red-500' :
                    currentStrength < 60 ? 'bg-yellow-500' :
                      currentStrength < 80 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                  style={{ width: `${currentStrength}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-gray-400 text-sm mb-3">Quick Presets</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-white text-sm transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Settings</h3>

            <div className="space-y-6">
              {/* Length */}
              <div>
                <label className="block text-gray-400 text-sm mb-3">
                  Password Length: {length}
                </label>
                <input
                  type="range"
                  min="4"
                  max="50"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>4</span>
                  <span>50</span>
                </div>
              </div>

              {/* Character Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Uppercase (A-Z)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Lowercase (a-z)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Numbers (0-9)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Symbols (!@#$%)</span>
                </label>
              </div>

              {/* Advanced Options */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeSimilar}
                    onChange={(e) => setExcludeSimilar(e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-white">Exclude similar characters (i, l, 1, L, o, 0, O)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* History & Tips */}
        <div className="space-y-6">
          {/* Password History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Recent Passwords
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {passwordHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No passwords generated yet.<br />
                  <span className="text-sm">Generate your first secure password!</span>
                </p>
              ) : (
                passwordHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => handleCopy(entry.password)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-semibold ${getStrengthColor(entry.strength)}`}>
                        {getStrengthLabel(entry.strength)}
                      </span>
                      <span className="text-xs text-gray-400">{entry.timestamp}</span>
                    </div>
                    <div className="font-mono text-sm text-white break-all">
                      {showPassword ? entry.password : '•'.repeat(entry.password.length)}
                    </div>
                  </div>
                ))
              )}
            </div>
            {passwordHistory.length > 0 && (
              <button
                onClick={() => setPasswordHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Security Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🔒 Security Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use unique passwords for each account</li>
              <li>• Enable two-factor authentication when possible</li>
              <li>• Store passwords in a password manager</li>
              <li>• Avoid using personal information in passwords</li>
              <li>• Change passwords if you suspect a breach</li>
            </ul>
          </div>

          {/* Password Strength Guide */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">💪 Strength Guide</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-400">Weak: Easy to crack</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-400">Fair: Moderate security</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">Good: Strong protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">Strong: Excellent security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGeneratorPage;