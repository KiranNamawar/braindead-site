import React, { useState } from 'react';
import { Heart, Brain, Zap, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

const SimpleFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Calculator', path: '/calculator' },
    { name: 'QR Generator', path: '/qr-generator' },
    { name: 'Password Gen', path: '/password-generator' },
    { name: 'Color Picker', path: '/color-picker' }
  ];

  const funFacts = [
    "🧠 0 brain cells required",
    "⚡ Faster than thinking",
    "🎯 100% accuracy guaranteed",
    "🚀 Productivity on autopilot"
  ];

  // Use useState to make random values stable
  const [randomFact] = useState(() => funFacts[Math.floor(Math.random() * funFacts.length)]);
  const [stats] = useState(() => ({
    brainCells: Math.floor(Math.random() * 1000) + 500,
    calculations: Math.floor(Math.random() * 50) + 10,
    passwords: Math.floor(Math.random() * 20) + 5
  }));

  return (
    <footer className="relative bg-gray-950 border-t border-gray-800 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                BrainDead
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Premium utility tools for effortless productivity
            </p>
            <div className="flex items-center justify-center md:justify-start text-blue-400 text-sm">
              <Zap className="w-4 h-4 mr-1" />
              <span>{randomFact}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-white font-semibold mb-4 flex items-center justify-center">
              <Coffee className="w-4 h-4 mr-2" />
              Quick Tools
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200 hover:underline"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Fun Stats */}
          <div className="text-center md:text-right">
            <h3 className="text-white font-semibold mb-4">Today's Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="text-gray-400">
                <span className="text-green-400 font-mono">
                  {stats.brainCells}
                </span> brain cells saved
              </div>
              <div className="text-gray-400">
                <span className="text-blue-400 font-mono">
                  {stats.calculations}
                </span> calculations done
              </div>
              <div className="text-gray-400">
                <span className="text-purple-400 font-mono">
                  {stats.passwords}
                </span> passwords generated
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-gray-400 text-sm">
              <span>© {currentYear} BrainDead</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center">
                Made with <Heart className="w-4 h-4 mx-1 text-red-400 animate-pulse" /> for lazy developers
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>No cookies</span>
              <span>•</span>
              <span>No tracking</span>
              <span>•</span>
              <span>Just tools</span>
            </div>
          </div>
        </div>

        {/* Easter Egg */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-xs italic">
            "Why think when you can click?" - Ancient Developer Proverb
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;