import React, { useState } from 'react';
import { GraduationCap, Calculator, TrendingUp, Copy, Trash2, BookOpen } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';
import GradeCalculator, { GradeCalculation } from '../tools/everyday-life/GradeCalculator';

const GradeCalculatorPage: React.FC = () => {
  const [history, setHistory] = useLocalStorage<(GradeCalculation & { timestamp: Date })[]>(
    STORAGE_KEYS.gradeCalculatorHistory, 
    []
  );
  const { showSuccess, showError } = useToast();

  const handleCalculation = (calculation: GradeCalculation) => {
    const historyItem = {
      ...calculation,
      timestamp: new Date()
    };

    setHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 calculations
    
    trackToolUsage('grade-calculator', 'calculation', {
      type: calculation.type,
      finalPercentage: calculation.finalPercentage,
      letterGrade: calculation.letterGrade,
      gpa: calculation.gpa,
      itemCount: calculation.items.length
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
      case 'weighted':
        return <Calculator className="w-4 h-4 text-blue-400" />;
      case 'gpa':
        return <GraduationCap className="w-4 h-4 text-green-400" />;
      case 'prediction':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      default:
        return <Calculator className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weighted':
        return 'Weighted Grade';
      case 'gpa':
        return 'GPA Calculation';
      case 'prediction':
        return 'Grade Prediction';
      default:
        return 'Grade Calculation';
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <BackButton />
      <SEOHead 
        title="Grade Calculator - BrainDead"
        description="Calculate weighted grades, GPA, and predict what you need to achieve your target grade. Because academic anxiety needs numbers."
        canonical="/grade-calculator"
      />
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Grade Calculator
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4">
          Calculate weighted grades, GPA, and predict what you need to achieve your target grade.
          <span className="text-blue-400"> Because academic anxiety needs numbers!</span>
        </p>
        
        {/* Fun Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span>Weighted calculations</span>
          </div>
          <div className="flex items-center text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
            <span>GPA conversion</span>
          </div>
          <div className="flex items-center text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span>Grade prediction</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Calculator */}
        <div className="lg:col-span-2">
          <GradeCalculator onCalculate={handleCalculation} />
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
                          `${calc.finalPercentage.toFixed(2)}% (${calc.letterGrade}, ${calc.gpa} GPA)`,
                          'Grade result'
                        )}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Copy result"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Percentage</div>
                        <div className={`font-mono font-bold text-sm ${getGradeColor(calc.finalPercentage)}`}>
                          {calc.finalPercentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Letter</div>
                        <div className={`font-bold text-sm ${getGradeColor(calc.finalPercentage)}`}>
                          {calc.letterGrade}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">GPA</div>
                        <div className={`font-mono font-bold text-sm ${getGradeColor(calc.finalPercentage)}`}>
                          {calc.gpa.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-gray-400 text-xs mb-2">
                      {calc.items.length} items • {calc.explanation}
                    </div>
                    
                    <div className="flex justify-between items-center">
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
              <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
              Quick Guide
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-blue-400 font-medium mb-1">Weighted Grade</div>
                <div className="text-gray-400">Calculate your current grade based on assignment weights</div>
                <div className="text-gray-500 text-xs">Each assignment contributes based on its weight percentage</div>
              </div>
              
              <div>
                <div className="text-green-400 font-medium mb-1">GPA Calculation</div>
                <div className="text-gray-400">Convert percentage to GPA points</div>
                <div className="text-gray-500 text-xs">Uses standard 4.0 scale with letter grades</div>
              </div>
              
              <div>
                <div className="text-purple-400 font-medium mb-1">Grade Prediction</div>
                <div className="text-gray-400">Find what you need on remaining assignments</div>
                <div className="text-gray-500 text-xs">Set target grade and see required scores</div>
              </div>
            </div>
          </div>

          {/* Grade Scale */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">📊 Grade Scale</h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 font-medium border-b border-gray-700 pb-2">
                <span>Letter</span>
                <span>Percentage</span>
                <span>GPA</span>
              </div>
              {[
                { letter: 'A+', range: '97-100%', gpa: '4.0', color: 'text-green-400' },
                { letter: 'A', range: '93-96%', gpa: '4.0', color: 'text-green-400' },
                { letter: 'A-', range: '90-92%', gpa: '3.7', color: 'text-green-300' },
                { letter: 'B+', range: '87-89%', gpa: '3.3', color: 'text-blue-400' },
                { letter: 'B', range: '83-86%', gpa: '3.0', color: 'text-blue-400' },
                { letter: 'B-', range: '80-82%', gpa: '2.7', color: 'text-blue-300' },
                { letter: 'C+', range: '77-79%', gpa: '2.3', color: 'text-yellow-400' },
                { letter: 'C', range: '73-76%', gpa: '2.0', color: 'text-yellow-400' },
                { letter: 'C-', range: '70-72%', gpa: '1.7', color: 'text-yellow-300' },
                { letter: 'D', range: '60-69%', gpa: '1.0', color: 'text-orange-400' },
                { letter: 'F', range: '0-59%', gpa: '0.0', color: 'text-red-400' }
              ].map((grade) => (
                <div key={grade.letter} className="grid grid-cols-3 gap-2 text-xs">
                  <span className={`font-bold ${grade.color}`}>{grade.letter}</span>
                  <span className="text-gray-400">{grade.range}</span>
                  <span className="text-gray-400 font-mono">{grade.gpa}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">💡 Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• <strong>Weight Distribution:</strong> Make sure weights add up to 100%</li>
              <li>• <strong>Grade Prediction:</strong> Use 0 for unfinished assignments</li>
              <li>• <strong>Extra Credit:</strong> Add as separate weighted items</li>
              <li>• <strong>Dropped Grades:</strong> Exclude lowest scores from calculation</li>
              <li>• <strong>Partial Credit:</strong> Use decimal scores (e.g., 87.5)</li>
              <li>• <strong>Categories:</strong> Group similar assignments together</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeCalculatorPage;