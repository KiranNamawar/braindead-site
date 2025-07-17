import React, { useState, useCallback } from 'react';
import { GraduationCap, Plus, Trash2, Calculator, Target, TrendingUp } from 'lucide-react';

export interface GradeItem {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  category?: string;
}

export interface GradeScale {
  letter: string;
  minPercentage: number;
  gpaPoints: number;
}

export interface GradeCalculation {
  type: 'weighted' | 'gpa' | 'prediction';
  items: GradeItem[];
  totalWeightedScore: number;
  totalWeight: number;
  finalPercentage: number;
  letterGrade: string;
  gpa: number;
  gradeScale: GradeScale[];
  explanation: string;
}

interface GradeCalculatorProps {
  onCalculate?: (calculation: GradeCalculation) => void;
  className?: string;
}

const DEFAULT_GRADE_SCALE: GradeScale[] = [
  { letter: 'A+', minPercentage: 97, gpaPoints: 4.0 },
  { letter: 'A', minPercentage: 93, gpaPoints: 4.0 },
  { letter: 'A-', minPercentage: 90, gpaPoints: 3.7 },
  { letter: 'B+', minPercentage: 87, gpaPoints: 3.3 },
  { letter: 'B', minPercentage: 83, gpaPoints: 3.0 },
  { letter: 'B-', minPercentage: 80, gpaPoints: 2.7 },
  { letter: 'C+', minPercentage: 77, gpaPoints: 2.3 },
  { letter: 'C', minPercentage: 73, gpaPoints: 2.0 },
  { letter: 'C-', minPercentage: 70, gpaPoints: 1.7 },
  { letter: 'D+', minPercentage: 67, gpaPoints: 1.3 },
  { letter: 'D', minPercentage: 63, gpaPoints: 1.0 },
  { letter: 'D-', minPercentage: 60, gpaPoints: 0.7 },
  { letter: 'F', minPercentage: 0, gpaPoints: 0.0 },
];

const GradeCalculator: React.FC<GradeCalculatorProps> = ({
  onCalculate,
  className = ''
}) => {
  const [gradeItems, setGradeItems] = useState<GradeItem[]>([
    {
      id: '1',
      name: 'Midterm Exam',
      score: 85,
      maxScore: 100,
      weight: 30,
      category: 'Exams'
    },
    {
      id: '2',
      name: 'Final Exam',
      score: 0,
      maxScore: 100,
      weight: 40,
      category: 'Exams'
    },
    {
      id: '3',
      name: 'Homework Average',
      score: 92,
      maxScore: 100,
      weight: 20,
      category: 'Assignments'
    },
    {
      id: '4',
      name: 'Participation',
      score: 95,
      maxScore: 100,
      weight: 10,
      category: 'Participation'
    }
  ]);
  
  const [gradeScale, setGradeScale] = useState<GradeScale[]>(DEFAULT_GRADE_SCALE);
  const [calculationType, setCalculationType] = useState<'weighted' | 'gpa' | 'prediction'>('weighted');
  const [targetGrade, setTargetGrade] = useState<string>('90');
  const [result, setResult] = useState<GradeCalculation | null>(null);

  const addGradeItem = useCallback(() => {
    const newItem: GradeItem = {
      id: Date.now().toString(),
      name: `Assignment ${gradeItems.length + 1}`,
      score: 0,
      maxScore: 100,
      weight: 10,
      category: 'Assignments'
    };
    setGradeItems(prev => [...prev, newItem]);
  }, [gradeItems.length]);

  const removeGradeItem = useCallback((id: string) => {
    setGradeItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateGradeItem = useCallback((id: string, field: keyof GradeItem, value: string | number) => {
    setGradeItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, []);

  const getLetterGrade = useCallback((percentage: number): { letter: string; gpa: number } => {
    for (const grade of gradeScale) {
      if (percentage >= grade.minPercentage) {
        return { letter: grade.letter, gpa: grade.gpaPoints };
      }
    }
    return { letter: 'F', gpa: 0.0 };
  }, [gradeScale]);

  const calculateWeightedGrade = useCallback((): GradeCalculation => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    gradeItems.forEach(item => {
      if (item.score > 0 && item.maxScore > 0) {
        const percentage = (item.score / item.maxScore) * 100;
        totalWeightedScore += percentage * (item.weight / 100);
        totalWeight += item.weight;
      }
    });

    const finalPercentage = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
    const { letter, gpa } = getLetterGrade(finalPercentage);

    return {
      type: 'weighted',
      items: gradeItems,
      totalWeightedScore,
      totalWeight,
      finalPercentage,
      letterGrade: letter,
      gpa,
      gradeScale,
      explanation: `Weighted average: ${finalPercentage.toFixed(2)}% (${letter}, ${gpa} GPA)`
    };
  }, [gradeItems, gradeScale, getLetterGrade]);

  const calculateGradePrediction = useCallback((): GradeCalculation => {
    const target = parseFloat(targetGrade);
    if (isNaN(target)) return calculateWeightedGrade();

    let currentWeightedScore = 0;
    let currentWeight = 0;
    let remainingWeight = 0;

    gradeItems.forEach(item => {
      if (item.score > 0 && item.maxScore > 0) {
        const percentage = (item.score / item.maxScore) * 100;
        currentWeightedScore += percentage * (item.weight / 100);
        currentWeight += item.weight;
      } else {
        remainingWeight += item.weight;
      }
    });

    const neededScore = remainingWeight > 0 
      ? ((target - (currentWeightedScore / currentWeight) * 100) * 100) / remainingWeight
      : 0;

    const { letter, gpa } = getLetterGrade(target);

    return {
      type: 'prediction',
      items: gradeItems,
      totalWeightedScore: currentWeightedScore,
      totalWeight: currentWeight + remainingWeight,
      finalPercentage: target,
      letterGrade: letter,
      gpa,
      gradeScale,
      explanation: remainingWeight > 0 
        ? `To achieve ${target}%, you need ${neededScore.toFixed(2)}% on remaining assignments (${remainingWeight}% weight)`
        : `Current grade: ${((currentWeightedScore / currentWeight) * 100).toFixed(2)}%`
    };
  }, [gradeItems, targetGrade, calculateWeightedGrade, getLetterGrade, gradeScale]);

  const handleCalculate = useCallback(() => {
    let calculation: GradeCalculation;

    switch (calculationType) {
      case 'prediction':
        calculation = calculateGradePrediction();
        break;
      case 'weighted':
      case 'gpa':
      default:
        calculation = calculateWeightedGrade();
        break;
    }

    setResult(calculation);
    onCalculate?.(calculation);
  }, [calculationType, calculateWeightedGrade, calculateGradePrediction, onCalculate]);

  const getTotalWeight = () => {
    return gradeItems.reduce((sum, item) => sum + item.weight, 0);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8 ${className}`}>
      {/* Calculation Type Selector */}
      <div className="mb-8">
        <label className="block text-white text-lg font-semibold mb-4 flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-blue-400" />
          Calculation Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { key: 'weighted', label: 'Weighted Grade', desc: 'Calculate current grade', icon: Calculator },
            { key: 'gpa', label: 'GPA Calculator', desc: 'Grade point average', icon: Target },
            { key: 'prediction', label: 'Grade Prediction', desc: 'What you need to achieve target', icon: TrendingUp }
          ].map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.key}
                onClick={() => setCalculationType(type.key as any)}
                className={`p-4 rounded-xl text-left transition-all duration-200 hover:scale-105 ${
                  calculationType === type.key
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                <div className="flex items-center mb-2">
                  <IconComponent className="w-4 h-4 mr-2" />
                  <div className="font-semibold text-sm">{type.label}</div>
                </div>
                <div className="text-xs opacity-75">{type.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Grade Input for Prediction */}
      {calculationType === 'prediction' && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
          <label className="block text-white text-sm font-medium mb-2">
            Target Grade (%)
          </label>
          <input
            type="number"
            value={targetGrade}
            onChange={(e) => setTargetGrade(e.target.value)}
            placeholder="Enter target percentage"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
      )}

      {/* Grade Items */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">Grade Items</h3>
          <button
            onClick={addGradeItem}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-400 hover:to-green-500 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {gradeItems.map((item, index) => (
            <div key={item.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-xs mb-1">Assignment Name</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateGradeItem(item.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Score</label>
                  <input
                    type="number"
                    value={item.score}
                    onChange={(e) => updateGradeItem(item.id, 'score', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Max Score</label>
                  <input
                    type="number"
                    value={item.maxScore}
                    onChange={(e) => updateGradeItem(item.id, 'maxScore', parseFloat(e.target.value) || 100)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    min="1"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Weight (%)</label>
                  <input
                    type="number"
                    value={item.weight}
                    onChange={(e) => updateGradeItem(item.id, 'weight', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                
                <div className="flex items-end justify-between">
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-1">Percentage</div>
                    <div className={`font-mono text-sm font-bold ${getGradeColor((item.score / item.maxScore) * 100)}`}>
                      {item.maxScore > 0 ? ((item.score / item.maxScore) * 100).toFixed(1) : '0.0'}%
                    </div>
                  </div>
                  
                  {gradeItems.length > 1 && (
                    <button
                      onClick={() => removeGradeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weight Summary */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Total Weight:</span>
            <span className={`font-mono font-bold ${getTotalWeight() === 100 ? 'text-green-400' : getTotalWeight() > 100 ? 'text-red-400' : 'text-yellow-400'}`}>
              {getTotalWeight()}%
            </span>
          </div>
          {getTotalWeight() !== 100 && (
            <div className="text-xs text-gray-500 mt-1">
              {getTotalWeight() > 100 ? 'Warning: Total weight exceeds 100%' : 'Note: Total weight is less than 100%'}
            </div>
          )}
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={gradeItems.length === 0}
        className="w-full py-4 px-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-blue-500 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Calculate Grade
      </button>

      {/* Results */}
      {result && (
        <div className="mt-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Grade Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Final Percentage</div>
              <div className={`text-3xl font-bold ${getGradeColor(result.finalPercentage)}`}>
                {result.finalPercentage.toFixed(2)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Letter Grade</div>
              <div className={`text-3xl font-bold ${getGradeColor(result.finalPercentage)}`}>
                {result.letterGrade}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">GPA Points</div>
              <div className={`text-3xl font-bold ${getGradeColor(result.finalPercentage)}`}>
                {result.gpa.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <div className="text-gray-300 text-center">{result.explanation}</div>
          </div>

          {/* Grade Breakdown */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-blue-400" />
              Grade Breakdown
            </h4>
            <div className="space-y-2">
              {result.items.map((item) => {
                const percentage = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;
                const contribution = (percentage * item.weight) / 100;
                return (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{item.name}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-400 font-mono">
                        {item.score}/{item.maxScore} ({percentage.toFixed(1)}%)
                      </span>
                      <span className="text-gray-400">×{item.weight}%</span>
                      <span className={`font-mono font-bold ${getGradeColor(percentage)}`}>
                        {contribution.toFixed(2)}pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeCalculator;