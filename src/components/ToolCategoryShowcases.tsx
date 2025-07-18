import React from 'react';
import { Calculator, FileText, Palette, Clock, Code, Hash } from 'lucide-react';
import ToolCategoryShowcase from './ToolCategoryShowcase';
import EverydayLifePreview from './previews/EverydayLifePreview';
import TextWritingPreview from './previews/TextWritingPreview';
import CreativeDesignPreview from './previews/CreativeDesignPreview';
import TimeProductivityPreview from './previews/TimeProductivityPreview';
import DeveloperPreview from './previews/DeveloperPreview';
import NumberConversionPreview from './previews/NumberConversionPreview';

const ToolCategoryShowcases: React.FC = () => {
  const categories = [
    {
      id: 'everyday-life',
      name: 'Everyday Life Calculators & Tools',
      description: 'Free online calculators for tip calculation, BMI, age calculation, loan payments, and percentage calculations. No signup required.',
      sarcasticQuote: 'Stop doing math on napkins like a caveman - let technology handle your basic arithmetic anxiety.',
      icon: Calculator,
      gradient: 'from-green-500 to-blue-600',
      tools: [
        { id: 'tip-calculator', name: 'Tip Calculator', path: '/tip-calculator', description: 'Calculate tips without looking cheap' },
        { id: 'age-calculator', name: 'Age Calculator', path: '/age-calculator', description: 'Existential precision down to the second' },
        { id: 'bmi-calculator', name: 'BMI Calculator', path: '/bmi-calculator', description: 'Health metrics without gym guilt' },
        { id: 'loan-calculator', name: 'Loan Calculator', path: '/loan-calculator', description: 'See how broke you\'ll be for 30 years' },
        { id: 'percentage-calculator', name: 'Percentage Calculator', path: '/percentage-calculator', description: 'Because mental math is overrated' },
        { id: 'grade-calculator', name: 'Grade Calculator', path: '/grade-calculator', description: 'Turn academic anxiety into numbers' }
      ],
      previewComponent: EverydayLifePreview
    },
    {
      id: 'text-writing',
      name: 'Text & Writing Tools',
      description: 'Free text analysis tools including word counter, case converter, lorem ipsum generator, diff checker, and text summarizer. No registration required.',
      sarcasticQuote: 'Transform your text without the Microsoft Word subscription - because paying monthly for basic text editing is peak capitalism.',
      icon: FileText,
      gradient: 'from-amber-500 to-orange-600',
      tools: [
        { id: 'word-counter', name: 'Word Counter & Analyzer', path: '/word-counter', description: 'Count words because apparently that matters' },
        { id: 'text-case-converter', name: 'Text Case Converter', path: '/text-case-converter', description: 'STOP YELLING or start whispering' },
        { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', path: '/lorem-ipsum', description: 'Fake text for real projects' },
        { id: 'diff-checker', name: 'Diff Checker', path: '/diff-checker', description: 'Compare text like a detective' },
        { id: 'text-summarizer', name: 'Text Summarizer', path: '/text-summarizer', description: 'TL;DR generator for your TL;DR life' }
      ],
      previewComponent: TextWritingPreview
    },
    {
      id: 'creative-design',
      name: 'Creative & Design Tools',
      description: 'Free design tools including CSS gradient generator, emoji picker, ASCII art generator, and favicon generator. Create beautiful designs without signup.',
      sarcasticQuote: 'Create beautiful designs without the art school debt - because creativity shouldn\'t require a mortgage.',
      icon: Palette,
      gradient: 'from-pink-500 to-red-600',
      tools: [
        { id: 'css-gradient-generator', name: 'CSS Gradient Generator', path: '/css-gradient-generator', description: 'Beautiful gradients without design degree' },
        { id: 'emoji-picker', name: 'Emoji Picker & Search', path: '/emoji-picker', description: 'Find perfect emoji for existential crisis' },
        { id: 'ascii-art-generator', name: 'ASCII Art Generator', path: '/ascii-art-generator', description: 'Because sometimes text needs to be extra' },
        { id: 'favicon-generator', name: 'Favicon Generator', path: '/favicon-generator', description: 'Tiny icons for your big dreams' }
      ],
      previewComponent: CreativeDesignPreview
    },
    {
      id: 'time-productivity',
      name: 'Time & Productivity Tools',
      description: 'Free productivity tools including Pomodoro timer, world clock, stopwatch, and countdown timer. Boost focus and manage time effectively.',
      sarcasticQuote: 'Procrastinate more efficiently with timed focus sessions - because if you\'re going to waste time, at least do it systematically.',
      icon: Clock,
      gradient: 'from-orange-500 to-red-600',
      tools: [
        { id: 'pomodoro-timer', name: 'Pomodoro Timer', path: '/pomodoro-timer', description: 'Productivity guilt in 25-minute intervals' },
        { id: 'world-clock', name: 'World Clock', path: '/world-clock', description: 'Know what time it is everywhere except where you are' },
        { id: 'stopwatch-timer', name: 'Stopwatch & Timer', path: '/stopwatch-timer', description: 'Time things because time is money (apparently)' },
        { id: 'countdown-timer', name: 'Countdown Timer', path: '/countdown-timer', description: 'Count down to vacation/deadline/crisis' }
      ],
      previewComponent: TimeProductivityPreview
    },
    {
      id: 'developer-tools',
      name: 'Developer Tools',
      description: 'Free developer tools including JSON formatter, Base64 encoder/decoder, UUID generator, JWT decoder, and URL encoder. Essential coding utilities.',
      sarcasticQuote: 'Debug your code, not your sanity - because life\'s too short to manually format JSON like it\'s 1999.',
      icon: Code,
      gradient: 'from-violet-500 to-fuchsia-600',
      tools: [
        { id: 'base64-encoder', name: 'Base64 Encoder/Decoder', path: '/base64-encoder', description: 'Making gibberish readable since 1987' },
        { id: 'url-encoder', name: 'URL Encoder/Decoder', path: '/url-encoder', description: 'Make URLs readable by humans again' },
        { id: 'json-formatter', name: 'JSON Formatter', path: '/json-formatter', description: 'Pretty print your data' },
        { id: 'markdown-editor', name: 'Markdown Editor', path: '/markdown-editor', description: 'Write formatted text without formatting headaches' },
        { id: 'uuid-generator', name: 'UUID Generator', path: '/uuid-generator', description: 'Unique IDs for your unique problems' },
        { id: 'jwt-decoder', name: 'JWT Decoder', path: '/jwt-decoder', description: 'Decode tokens without the mystery' }
      ],
      previewComponent: DeveloperPreview
    },
    {
      id: 'number-conversion',
      name: 'Number & Conversion Tools',
      description: 'Free number conversion tools including binary, hexadecimal, decimal, octal, and Roman numeral converters. Convert between number bases instantly.',
      sarcasticQuote: 'Convert numbers like a computer science student - because manually calculating binary is what separates us from the machines.',
      icon: Hash,
      gradient: 'from-cyan-500 to-blue-600',
      tools: [
        { id: 'binary-converter', name: 'Binary/Hex/Decimal Converter', path: '/binary-converter', description: 'Convert numbers like a computer science student' },
        { id: 'roman-numeral-converter', name: 'Roman Numeral Converter', path: '/roman-numeral-converter', description: 'Because sometimes you need to feel ancient' }
      ],
      previewComponent: NumberConversionPreview
    }
  ];

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Tool <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Categories</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Organized collections of tools for every type of procrastination and productivity need. 
            Try before you click - because commitment is scary.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ToolCategoryShowcase category={category} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Can't Find What You Need?
            </h3>
            <p className="text-gray-400 mb-6">
              Don't worry, we probably have it. Use the search to find exactly what your brain is too lazy to remember.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-white hover:scale-105 transition-all duration-300">
                Search All Tools
              </button>
              <div className="text-sm text-gray-500">
                Or just scroll down and browse like it's 2005
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolCategoryShowcases;