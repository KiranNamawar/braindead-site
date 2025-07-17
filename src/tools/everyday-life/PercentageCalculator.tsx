import React, { useState, useCallback } from 'react';
import { Percent, Calculator, TrendingUp, TrendingDown } from 'lucide-react';

export interface PercentageCalculation {
  type: 'basic' | 'increase' | 'decrease' | 'of-total' | 'change';
  value1: number;
  value2: number;
  result: number;
  explanation: string;
  formula: string;
}

interface PercentageCalculatorProps {
  onCalculate?: (calculation: PercentageCalculation) => void;
  className?: string;
}

const PercentageCalculator: React.FC<PercentageCalculatorProps> = ({
  onCalculate,
  className = ''
}) => {
  const [calculationType, setCalculationType] = useState<'basic' | 'increase' | 'decrease' | 'of-total' | 'change'>('basic');
  const [value1, setValue1] = useState<string>('');
  const [value2, setValue2] = useState<string>('');
  const [result, setResult] = useState<PercentageCalculation | null>(null);

  const calculateBasicPercentage = useCallback((num: number, percent: number): PercentageCalculation => {
    const result = (num * percent) / 100;
    return {
      type: 'basic',
      value1: num,
      value2: percent,
      result,
      explanation: `${percent}% of ${num} is ${result}`,
      formula: `(${num} × ${percent}) ÷ 100 = ${result}`
    };
  }, []);

  const calculatePercentageIncrease = useCallback((original: number, newValue: number): PercentageCalculation => {
    const increase = newValue - original;
    const percentIncrease = (increase / original) * 100;
    return {
      type: 'increase',
      value1: original,
      value2: newValue,
      result: percentIncrease,
      explanation: `${original} increased to ${newValue} is a ${percentIncrease.toFixed(2)}% increase`,
      formula: `((${newValue} - ${original}) ÷ ${original}) × 100 = ${percentIncrease.toFixed(2)}%`
    };
  }, []);

  const calculatePercentageDecrease = useCallback((original: number, newValue: number): PercentageCalculation => {
    const decrease = original - newValue;
    const percentDecrease = (decrease / original) * 100;
    return {
      type: 'decrease',
      value1: original,
      value2: newValue,
      result: percentDecrease,
      explanation: `${original} decreased to ${newValue} is a ${percentDecrease.toFixed(2)}% decrease`,
      formula: `((${original} - ${newValue}) ÷ ${original}) × 100 = ${percentDecrease.toFixed(2)}%`
    };
  }, []);

  const calculatePercentageOfTotal = useCallback ((part: number, total: number): PercentageCalculation => {
    const percentage = (part / total) * 100;
    return {
      type: 'of-total',
      value1: part,
      value2: total,
      result: percentage,
      explanation: `${part} is ${percentage.toFixed(2)}% of ${total}`,
      formula: `(${part} ÷ ${total}) × 100 = ${percentage.toFixed(2)}%`
    };
  }, []);

  const calculatePercentageChange = useCallback((oldValue: number, newValue: number): PercentageCalculation => {
    const change = newValue - oldValue;
    const percentChange = (change / Math.abs(oldValue)) * 100;
    const isIncrease = change > 0;
    
    return {
      type: 'change',
      value1: oldValue,
      value2: newValue,
      result: percentChange,
      explanation: `Change from ${oldValue} to ${newValue} is ${Math.abs(percentChange).toFixed(2)}% ${isIncrease ? 'increase' : 'decrease'}`,
      formula: `((${newValue} - ${oldValue}) ÷ |${oldValue}|) × 100 = ${percentChange.toFixed(2)}%`
    };
  }, []);

  const handleCalculate = useCallback(() => {
    const num1 = parseFloat(value1);
    const num2 = parseFloat(value2);

    if (isNaN(num1) || isNaN(num2)) {
      return;
    }

    let calculation: PercentageCalculation;

    switch (calculationType) {
      case 'basic':
        calculation = calculateBasicPercentage(num1, num2);
        break;
      case 'increase':
        calculation = calculatePercentageIncrease(num1, num2);
        break;
      case 'decrease':
        calculation = calculatePercentageDecrease(num1, num2);
        break;
      case 'of-total':
        calculation = calculatePercentageOfTotal(num1, num2);
        break;
      case 'change':
        calculation = calculatePercentageChange(num1, num2);
        break;
      default:
        return;
    }

    setResult(calculation);
    onCalculate?.(calculation);
  }, [calculationType, value1, value2, calculateBasicPercentage, calculatePercentageIncrease, calculatePercentageDecrease, calculatePercentageOfTotal, calculatePercentageChange, onCalculate]);

  const getCalculationTypeInfo = (type: string) => {
    switch (type) {
      case 'basic':
        return {
          title: 'Basic Percentage',
          description: 'Calculate X% of a number',
          placeholder1: 'Number',
          placeholder2: 'Percentage',
          icon: Calculator
        };
      case 'increase':
        return {
          title: 'Percentage Increase',
          description: 'Calculate percentage increase from old to new value',
          placeholder1: 'Original Value',
          placeholder2: 'New Value',
          icon: TrendingUp
        };
      case 'decrease':
        return {
          title: 'Percentage Decrease',
          description: 'Calculate percentage decrease from old to new value',
          placeholder1: 'Original Value',
          placeholder2: 'New Value',
          icon: TrendingDown
        };
      case 'of-total':
        return {
          title: 'Percentage of Total',
          description: 'What percentage is X of Y?',
          placeholder1: 'Part',
          placeholder2: 'Total',
          icon: Percent
        };
      case 'change':
        return {
          title: 'Percentage Change',
          description: 'Calculate percentage change (increase or decrease)',
          placeholder1: 'Old Value',
          placeholder2: 'New Value',
          icon: TrendingUp
        };
      default:
        return {
          title: 'Basic Percentage',
          description: 'Calculate X% of a number',
          placeholder1: 'Number',
          placeholder2: 'Percentage',
          icon: Calculator
        };
    }
  };

  const typeInfo = getCalculationTypeInfo(calculationType);
  const IconComponent = typeInfo.icon;

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8 ${className}`}>
      {/* Calculation Type Selector */}
      <div className="mb-8">
        <label className="block text-white text-lg font-semibold mb-4 flex items-center">
          <IconComponent className="w-5 h-5 mr-2 text-blue-400" />
          Calculation Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'basic', label: 'Basic %', desc: 'X% of Y' },
            { key: 'increase', label: 'Increase', desc: '% Growth' },
            { key: 'decrease', label: 'Decrease', desc: '% Reduction' },
            { key: 'of-total', label: 'Of Total', desc: 'X is Y% of Z' },
            { key: 'change', label: 'Change', desc: '% Difference' }
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => setCalculationType(type.key as any)}
              className={`p-4 rounded-xl text-left transition-all duration-200 hover:scale-105 ${
                calculationType === type.key
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
              }`}
            >
              <div className="font-semibold text-sm">{type.label}</div>
              <div className="text-xs opacity-75 mt-1">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Calculation Info */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-2">{typeInfo.title}</h3>
        <p className="text-gray-400 text-sm">{typeInfo.description}</p>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            {typeInfo.placeholder1}
          </label>
          <input
            type="number"
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            placeholder={`Enter ${typeInfo.placeholder1.toLowerCase()}`}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            step="any"
          />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            {typeInfo.placeholder2}
          </label>
          <input
            type="number"
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
            placeholder={`Enter ${typeInfo.placeholder2.toLowerCase()}`}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            step="any"
          />
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={!value1 || !value2 || isNaN(parseFloat(value1)) || isNaN(parseFloat(value2))}
        className="w-full py-4 px-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-blue-500 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Calculate Percentage
      </button>

      {/* Results */}
      {result && (
        <div className="mt-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Result</h3>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {typeof result.result === 'number' ? result.result.toFixed(2) : result.result}
              {(result.type === 'increase' || result.type === 'decrease' || result.type === 'of-total' || result.type === 'change') && '%'}
            </div>
            <div className="text-gray-400 text-lg">{result.explanation}</div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-blue-400" />
              Formula
            </h4>
            <div className="text-gray-300 font-mono text-sm bg-gray-900/50 rounded-lg p-3">
              {result.formula}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PercentageCalculator;