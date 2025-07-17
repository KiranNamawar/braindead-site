import React, { useState } from 'react';
import { Percent, Calculator, TrendingUp, Copy, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';
import PercentageCalculator, { PercentageCalculation } from '../tools/everyday-life/PercentageCalculator';

const PercentageCalculatorPage: React.FC = () => {
  const [history, setHistory] = useLocalStorage<(PercentageCalculation & { timestamp: Date })[]>(
    STORAGE_KEYS.percentageCalculatorHistory, 
    []
  );
  const { showSuccess, showError } = useToast();

  const handleCalculation = (calculation: PercentageCalculation) => {
    const historyItem = {
      ...calculation,
      timestamp: new Date()
    };

    setHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 calculations
    
    trackToolUsage('percentage-calculator', 'calculation', {
      type: calculation.type,
      value1: calculation.value1,
      value2: calculation.value2,
      result: calculation.result
    });
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`${label} copied to clipboard!`);
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    showSuccess('History cleared');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decrease':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      case 'of-total':
        return <Percent className="w-4 h-4 text-blue-400" />;
      case 'change':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      default:
        return <Calculator className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'basic':
        return 'Basic %';
      case 'increase':
        return 'Increase';
      case 'decrease':
        return 'Decrease';
      case 'of-total':
        return 'Of Total';
      case 'change':
        return 'Change';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <BackButton />
      <SEOHead 
        title="Percentage Calculator - BrainDead"
        description="Calculate percentages, increases, decreases, and percentage changes with clear explanations. Because mental math is overrated."
        canonical="/percentage-calculator"
      />
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
          <Percent className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Percentage Calculator
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4">
          Calculate percentages, increases, decreases, and changes with clear explanations.
          <span className="text-blue-400"> Because mental math is overrated!</span>
        </p>
        
        {/* Fun Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span>Multiple calculation types</span>
          </div>
          <div className="flex items-center text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
            <span>Clear explanations</span>
          </div>
          <div className="flex items-center text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span>Formula breakdowns</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Calculator */}
        <div className="lg:col-span-2">
          <PercentageCalculator onCalculate={handleCalculation} />
        </div>

        {/* History & Guide */}
        <div className="lg:col-span-1 space-y-6">
          {/* History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                History
              </h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Clear history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No calculations yet.<br />
                  <span className="text-sm">Start calculating to see history!</span>
                </p>
              ) : (
                history.map((calc, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-lg p-3 text-sm hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getTypeIcon(calc.type)}
                        <span className="text-gray-300 font-medium ml-2">
                          {getTypeLabel(calc.type)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(
                          `${calc.result}${(calc.type === 'increase' || calc.type === 'decrease' || calc.type === 'of-total' || calc.type === 'change') ? '%' : ''}`,
                          'Result'
                        )}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Copy result"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="text-gray-400 text-xs mb-2">
                      {calc.explanation}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 font-mono font-bold">
                        {typeof calc.result === 'number' ? calc.result.toFixed(2) : calc.result}
                        {(calc.type === 'increase' || calc.type === 'decrease' || calc.type === 'of-total' || calc.type === 'change') && '%'}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(calc.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Guide */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-400" />
              Quick Guide
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-blue-400 font-medium mb-1">Basic Percentage</div>
                <div className="text-gray-400">Calculate X% of a number</div>
                <div className="text-gray-500 text-xs font-mono">25% of 200 = 50</div>
              </div>
              
              <div>
                <div className="text-green-400 font-medium mb-1">Percentage Increase</div>
                <div className="text-gray-400">Growth from old to new value</div>
                <div className="text-gray-500 text-xs font-mono">100 → 120 = 20% increase</div>
              </div>
              
              <div>
                <div className="text-red-400 font-medium mb-1">Percentage Decrease</div>
                <div className="text-gray-400">Reduction from old to new value</div>
                <div className="text-gray-500 text-xs font-mono">100 → 80 = 20% decrease</div>
              </div>
              
              <div>
                <div className="text-purple-400 font-medium mb-1">Percentage of Total</div>
                <div className="text-gray-400">What % is X of Y?</div>
                <div className="text-gray-500 text-xs font-mono">25 is 25% of 100</div>
              </div>
              
              <div>
                <div className="text-yellow-400 font-medium mb-1">Percentage Change</div>
                <div className="text-gray-400">Overall change (+ or -)</div>
                <div className="text-gray-500 text-xs font-mono">Auto-detects increase/decrease</div>
              </div>
            </div>
          </div>

          {/* Common Uses */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">💡 Common Uses</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• <strong>Sales & Discounts:</strong> Calculate savings</li>
              <li>• <strong>Tips & Taxes:</strong> Add percentages to bills</li>
              <li>• <strong>Growth Analysis:</strong> Track business metrics</li>
              <li>• <strong>Grade Calculations:</strong> Academic percentages</li>
              <li>• <strong>Financial Planning:</strong> Interest & returns</li>
              <li>• <strong>Data Analysis:</strong> Compare values</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PercentageCalculatorPage;