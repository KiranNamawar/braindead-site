import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Star, 
  Zap, 
  Shield, 
  Clock as ClockIcon,
  Calculator, 
  Palette, 
  QrCode, 
  FileText, 
  Lock, 
  Hash, 
  Image as ImageIcon, 
  Clock, 
  Code, 
  Shuffle,
  Search
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import SearchModal from '../components/SearchModal';
import FavoritesSection from '../components/FavoritesSection';
import FavoriteButton from '../components/FavoriteButton';
import RecentToolsSection from '../components/RecentToolsSection';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ToolCategoryShowcases from '../components/ToolCategoryShowcases';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import EnhancedFeaturesSection from '../components/EnhancedFeaturesSection';
import PWAPromotionSection from '../components/PWAPromotionSection';
import EnhancedTestimonialsSection from '../components/EnhancedTestimonialsSection';
import { useSearchModal } from '../hooks/useSearchModal';

const HomePage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isOpen: isSearchOpen, openModal: openSearch, closeModal: closeSearch } = useSearchModal();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToTool = (toolId: string) => {
    const element = document.getElementById(toolId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tools = [
    {
      id: 'calculator',
      name: 'Calculator',
      description: 'A calculator so smart, it makes your phone jealous. Finally, a calculator that remembers what 2+2 equals when your brain doesn\'t.',
      icon: Calculator,
      gradient: 'from-blue-500 to-purple-600',
      path: '/calculator',
      features: ['Basic arithmetic operations', 'History tracking', 'Keyboard support', 'Memory functions'],
      quote: 'Finally, a calculator that won\'t judge you for using it to calculate 15% tip on a $10 bill.'
    },
    {
      id: 'color-picker',
      name: 'Color Picker',
      description: 'Extract colors from images and generate palettes. Because naming colors is harder than naming your firstborn.',
      icon: Palette,
      gradient: 'from-pink-500 to-red-600',
      path: '/color-picker',
      features: ['Image color extraction', 'Palette generation', 'Multiple color formats', 'Color history'],
      quote: 'Turns "that bluish-greenish thing" into actual hex codes that designers can use.'
    },
    {
      id: 'qr-generator',
      name: 'QR Generator',
      description: 'Create QR codes for URLs, text, and more. Because typing URLs is so last century.',
      icon: QrCode,
      gradient: 'from-emerald-500 to-teal-600',
      path: '/qr-generator',
      features: ['Custom QR codes', 'Multiple formats', 'Color customization', 'Download options'],
      quote: 'Making it easier to share links than explaining how to spell your domain name.'
    },
    {
      id: 'text-tools',
      name: 'Text Tools',
      description: 'Transform and analyze text with powerful utilities. For when manual text editing feels like medieval torture.',
      icon: FileText,
      gradient: 'from-amber-500 to-orange-600',
      path: '/text-tools',
      features: ['Text transformation', 'Word counting', 'Format conversion', 'Data extraction'],
      quote: 'Transforms your text faster than you can say "find and replace".'
    },
    {
      id: 'password-generator',
      name: 'Password Generator',
      description: 'Generate secure passwords that even hackers would respect. Because "password123" isn\'t cutting it anymore.',
      icon: Lock,
      gradient: 'from-purple-500 to-indigo-600',
      path: '/password-generator',
      features: ['Customizable length', 'Character options', 'Strength analysis', 'Secure generation'],
      quote: 'Creates passwords so strong, even you won\'t be able to remember them.'
    },
    {
      id: 'hash-generator',
      name: 'Hash Generator',
      description: 'Generate cryptographic hashes for data integrity. Because trust, but verify!',
      icon: Hash,
      gradient: 'from-cyan-500 to-blue-600',
      path: '/hash-generator',
      features: ['Multiple algorithms', 'File hashing', 'Batch processing', 'Verification tools'],
      quote: 'Turns your data into unreadable gibberish that\'s somehow more secure.'
    },
    {
      id: 'image-optimizer',
      name: 'Image Optimizer',
      description: 'Compress images without losing quality. Because nobody likes slow-loading websites.',
      icon: ImageIcon,
      gradient: 'from-teal-500 to-green-600',
      path: '/image-optimizer',
      features: ['Lossless compression', 'Format conversion', 'Batch processing', 'Quality control'],
      quote: 'Makes your images lighter than your conscience after using ad-blockers.'
    },
    {
      id: 'timestamp-converter',
      name: 'Timestamp Converter',
      description: 'Convert between timestamps and human dates. Because time is relative, but deadlines aren\'t.',
      icon: Clock,
      gradient: 'from-indigo-500 to-cyan-600',
      path: '/timestamp-converter',
      features: ['Unix timestamps', 'Multiple formats', 'Timezone support', 'Batch conversion'],
      quote: 'Converts timestamps faster than you can say "what time is 1640995200?"'
    },
    {
      id: 'json-formatter',
      name: 'JSON Formatter',
      description: 'Format and validate JSON data. Because messy JSON is a crime against humanity.',
      icon: Code,
      gradient: 'from-violet-500 to-fuchsia-600',
      path: '/json-formatter',
      features: ['Pretty printing', 'Validation', 'Minification', 'Error detection'],
      quote: 'Makes your JSON prettier than a sunset over Silicon Valley.'
    },
    {
      id: 'random-generator',
      name: 'Random Generator',
      description: 'Generate random data for testing and development. Because sometimes you need chaos in your life.',
      icon: Shuffle,
      gradient: 'from-rose-500 to-purple-600',
      path: '/random-generator',
      features: ['Multiple data types', 'Custom ranges', 'Bulk generation', 'Export options'],
      quote: 'Generates random data more reliably than your creative process.'
    },
    {
      id: 'unit-converter',
      name: 'Unit Converter',
      description: 'Convert between different units of measurement. Because math is hard, but conversion shouldn\'t be.',
      icon: Zap,
      gradient: 'from-yellow-500 to-orange-600',
      path: '/unit-converter',
      features: ['Multiple categories', 'Precise calculations', 'History tracking', 'Quick presets'],
      quote: 'Converts units faster than you can Google "how many feet in a meter".'
    },
    {
      id: 'tip-calculator',
      name: 'Tip Calculator',
      description: 'Calculate tips and split bills effortlessly. No more awkward math at restaurants or wondering if 18% is too much.',
      icon: Calculator,
      gradient: 'from-green-500 to-blue-600',
      path: '/tip-calculator',
      features: ['Bill splitting', 'Custom tip percentages', 'Currency formatting', 'History tracking'],
      quote: 'Calculate tips without looking cheap or overpaying - napkin math is now obsolete.'
    },
    {
      id: 'age-calculator',
      name: 'Age Calculator',
      description: 'Find out exactly how old you are (down to the minute). Because existential precision matters!',
      icon: ClockIcon,
      gradient: 'from-purple-500 to-pink-600',
      path: '/age-calculator',
      features: ['Precise age calculation', 'Leap year handling', 'Timezone support', 'Age comparisons'],
      quote: 'Calculate your age with existential precision - because knowing you\'re exactly 10,957 days old hits different.'
    },
    {
      id: 'grade-calculator',
      name: 'Grade Calculator',
      description: 'Calculate weighted grades, GPA, and predict what you need to achieve your target grade. Because academic anxiety needs numbers!',
      icon: Calculator,
      gradient: 'from-indigo-500 to-purple-600',
      path: '/grade-calculator',
      features: ['Weighted grade calculations', 'GPA conversion', 'Grade prediction', 'Custom grade scales'],
      quote: 'Turn your academic stress into precise calculations - because knowing you need 97% on the final is somehow better than not knowing.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      <SEOHead />
      
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        <div 
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-8 shadow-2xl">
              {/* Dead Brain Logo with X eyes */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Brain shape */}
                <path d="M24 6C30 6 35 11 35 17C35 20 34 22.5 32.5 24.5C33.5 25.5 34 27 34 28.5C34 32 31 35 27.5 35H20.5C17 35 14 32 14 28.5C14 27 14.5 25.5 15.5 24.5C14 22.5 13 20 13 17C13 11 18 6 24 6Z" fill="white" opacity="0.95"/>
                {/* Brain division */}
                <path d="M24 6C24 15 24 30 24 35" stroke="#3b82f6" strokeWidth="1" opacity="0.3"/>
                {/* X Eyes (Dead brain) */}
                <g stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9">
                  {/* Left X eye */}
                  <line x1="19" y1="14" x2="21" y2="16"/>
                  <line x1="21" y1="14" x2="19" y2="16"/>
                  {/* Right X eye */}
                  <line x1="27" y1="14" x2="29" y2="16"/>
                  <line x1="29" y1="14" x2="27" y2="16"/>
                </g>
                {/* Sleepy mouth */}
                <path d="M21 22C22 23 26 23 27 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
              </svg>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                BrainDead
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-400 mb-4 font-light">
              Premium utility tools for effortless productivity
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              No thinking required, results guaranteed. 13 powerful tools designed for maximum efficiency.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <button
              onClick={openSearch}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl font-semibold text-white hover:from-purple-400 hover:to-pink-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Search Tools</span>
              <kbd className="ml-2 px-2 py-1 bg-white/20 rounded text-xs">Ctrl+K</kbd>
            </button>
            <button
              onClick={() => scrollToTool('calculator')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold text-white hover:from-blue-400 hover:to-purple-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <span>Explore Tools</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>13 Premium Utility Tools</span>
              
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Zero Brain Cells Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Favorites Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <FavoritesSection />
        </div>
      </section>

      {/* Recent Tools Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <RecentToolsSection />
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <PersonalizedRecommendations />
        </div>
      </section>

      {/* Analytics Dashboard */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <AnalyticsDashboard />
        </div>
      </section>

      {/* Tool Category Showcases */}
      <ToolCategoryShowcases />

      {/* Tools Grid */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Weapon</span>
            </h2>
            <p className="text-gray-400 text-lg">
              13 powerful tools to make your life easier (and your brain lazier)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <div
                key={tool.id}
                id={tool.id}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 hover:border-gray-700 transition-all duration-500 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Favorite Button */}
                <div className="absolute top-4 right-4">
                  <FavoriteButton toolId={tool.id} size="md" />
                </div>

                <div className="mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${tool.gradient} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{tool.name}</h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">{tool.description}</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-400 text-sm">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border-l-4 border-gradient-to-b from-blue-500 to-purple-600">
                  <p className="text-gray-300 text-sm italic">"{tool.quote}"</p>
                </div>

                <Link
                  to={tool.path}
                  className={`inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r ${tool.gradient} rounded-xl font-semibold text-white hover:scale-105 transition-all duration-300 group-hover:shadow-lg`}
                >
                  <span>Try {tool.name}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <EnhancedFeaturesSection />

      {/* PWA Promotion Section */}
      <PWAPromotionSection />

      {/* Enhanced Testimonials Section */}
      <EnhancedTestimonialsSection />

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm border border-gray-800 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Embrace Your Inner <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Laziness</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of smart professionals who've discovered the joy of effortless productivity. 
              Your brain will thank you (eventually).
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => scrollToTool('calculator')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold text-white hover:from-blue-400 hover:to-purple-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Being Lazy</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="text-gray-400 text-sm">
                No signup required • No brain cells harmed • 100% Free
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </div>
  );
};

export default HomePage;