import React, { useState, useEffect } from 'react';
import { Activity, Scale, User, Heart, Copy, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';

interface BMICalculation {
  weight: number;
  height: number;
  unit: 'metric' | 'imperial';
  bmi: number;
  category: string;
  healthyWeightRange: {
    min: number;
    max: number;
  };
  timestamp: Date;
  label?: string;
}

interface BMICategory {
  name: string;
  range: string;
  color: string;
  description: string;
  healthRisk: string;
}

const BMICalculatorPage: React.FC = () => {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [feet, setFeet] = useState<string>('');
  const [inches, setInches] = useState<string>('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [label, setLabel] = useState<string>('');
  const [history, setHistory] = useLocalStorage<BMICalculation[]>(STORAGE_KEYS.bmiCalculatorHistory || 'bmi-calculator-history', []);
  const { showSuccess, showError } = useToast();

  // BMI Categories with health information
  const bmiCategories: BMICategory[] = [
    {
      name: 'Underweight',
      range: '< 18.5',
      color: 'text-blue-400',
      description: 'Below normal weight',
      healthRisk: 'May indicate malnutrition or other health issues'
    },
    {
      name: 'Normal weight',
      range: '18.5 - 24.9',
      color: 'text-green-400',
      description: 'Healthy weight range',
      healthRisk: 'Low risk of weight-related health problems'
    },
    {
      name: 'Overweight',
      range: '25.0 - 29.9',
      color: 'text-yellow-400',
      description: 'Above normal weight',
      healthRisk: 'Increased risk of health problems'
    },
    {
      name: 'Obese Class I',
      range: '30.0 - 34.9',
      color: 'text-orange-400',
      description: 'Moderately obese',
      healthRisk: 'High risk of health problems'
    },
    {
      name: 'Obese Class II',
      range: '35.0 - 39.9',
      color: 'text-red-400',
      description: 'Severely obese',
      healthRisk: 'Very high risk of health problems'
    },
    {
      name: 'Obese Class III',
      range: '≥ 40.0',
      color: 'text-red-500',
      description: 'Very severely obese',
      healthRisk: 'Extremely high risk of health problems'
    }
  ];

  // Calculate BMI and related information
  const calculateBMI = (): BMICalculation | null => {
    const weightNum = parseFloat(weight);
    let heightNum: number;

    if (unit === 'metric') {
      heightNum = parseFloat(height);
    } else {
      const feetNum = parseFloat(feet) || 0;
      const inchesNum = parseFloat(inches) || 0;
      heightNum = (feetNum * 12 + inchesNum) * 2.54; // Convert to cm
    }

    if (isNaN(weightNum) || isNaN(heightNum) || weightNum <= 0 || heightNum <= 0) {
      return null;
    }

    // Convert to metric for calculation
    const weightKg = unit === 'metric' ? weightNum : weightNum * 0.453592; // lbs to kg
    const heightM = heightNum / 100; // cm to m

    const bmi = weightKg / (heightM * heightM);
    const roundedBMI = Math.round(bmi * 10) / 10;

    // Determine category
    let category = '';
    if (roundedBMI < 18.5) category = 'Underweight';
    else if (roundedBMI < 25) category = 'Normal weight';
    else if (roundedBMI < 30) category = 'Overweight';
    else if (roundedBMI < 35) category = 'Obese Class I';
    else if (roundedBMI < 40) category = 'Obese Class II';
    else category = 'Obese Class III';

    // Calculate healthy weight range (BMI 18.5-24.9)
    const minHealthyWeight = 18.5 * heightM * heightM;
    const maxHealthyWeight = 24.9 * heightM * heightM;

    const healthyWeightRange = {
      min: unit === 'metric' 
        ? Math.round(minHealthyWeight * 10) / 10
        : Math.round(minHealthyWeight * 2.20462 * 10) / 10, // kg to lbs
      max: unit === 'metric'
        ? Math.round(maxHealthyWeight * 10) / 10
        : Math.round(maxHealthyWeight * 2.20462 * 10) / 10
    };

    return {
      weight: weightNum,
      height: unit === 'metric' ? heightNum : parseFloat(feet) * 12 + parseFloat(inches),
      unit,
      bmi: roundedBMI,
      category,
      healthyWeightRange,
      timestamp: new Date(),
      label
    };
  };

  const currentBMI = calculateBMI();

  // Get BMI category info
  const getBMICategory = (bmi: number): BMICategory => {
    if (bmi < 18.5) return bmiCategories[0];
    if (bmi < 25) return bmiCategories[1];
    if (bmi < 30) return bmiCategories[2];
    if (bmi < 35) return bmiCategories[3];
    if (bmi < 40) return bmiCategories[4];
    return bmiCategories[5];
  };

  // Save calculation to history
  const handleSaveCalculation = () => {
    if (!currentBMI) {
      showError('Please enter valid weight and height');
      return;
    }

    const calculationWithLabel = { ...currentBMI, label: label || 'BMI Calculation' };
    setHistory(prev => [calculationWithLabel, ...prev.slice(0, 49)]);
    
    trackToolUsage('bmi-calculator', 'calculation', {
      bmi: currentBMI.bmi,
      category: currentBMI.category,
      unit
    });
    
    showSuccess('Calculation saved to history');
  };

  // Copy result to clipboard
  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`${label} copied to clipboard!`);
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  // Format weight display
  const formatWeight = (weight: number, unit: 'metric' | 'imperial'): string => {
    return `${weight} ${unit === 'metric' ? 'kg' : 'lbs'}`;
  };

  // Format height display
  const formatHeight = (height: number, unit: 'metric' | 'imperial'): string => {
    if (unit === 'metric') {
      return `${height} cm`;
    } else {
      const feet = Math.floor(height / 12);
      const inches = height % 12;
      return `${feet}'${inches}"`;
    }
  };

  // Clear all inputs
  const clearAll = () => {
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setLabel('');
  };

  // Load calculation from history
  const loadFromHistory = (calc: BMICalculation) => {
    setWeight(calc.weight.toString());
    setUnit(calc.unit);
    setLabel(calc.label || '');
    
    if (calc.unit === 'metric') {
      setHeight(calc.height.toString());
    } else {
      const feet = Math.floor(calc.height / 12);
      const inches = calc.height % 12;
      setFeet(feet.toString());
      setInches(inches.toString());
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <BackButton />
      <SEOHead 
        title="BMI Calculator - BrainDead"
        description="Calculate your Body Mass Index (BMI) with metric and imperial units. Get health range indicators and track your progress without the gym membership guilt."
        canonical="/bmi-calculator"
      />
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl mb-6 shadow-lg">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
          BMI Calculator
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4">
          Health metrics without the gym membership guilt. 
          <span className="text-pink-400"> Calculate your BMI and pretend you'll do something about it!</span>
        </p>
        
        {/* Fun Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center text-pink-400">
            <div className="w-2 h-2 bg-pink-400 rounded-full mr-2 animate-pulse"></div>
            <span>Metric & Imperial units</span>
          </div>
          <div className="flex items-center text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
            <span>Health range indicators</span>
          </div>
          <div className="flex items-center text-orange-400">
            <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
            <span>No judgment included</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Calculator */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8">
            {/* Unit Selection */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4">
                Unit System
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setUnit('metric')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                    unit === 'metric'
                      ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                  }`}
                >
                  Metric (kg, cm)
                </button>
                <button
                  onClick={() => setUnit('imperial')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                    unit === 'imperial'
                      ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                  }`}
                >
                  Imperial (lbs, ft/in)
                </button>
              </div>
            </div>

            {/* Weight Input */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                <Scale className="w-5 h-5 mr-2 text-pink-400" />
                Weight
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={unit === 'metric' ? '70' : '154'}
                  className="w-full pr-16 pl-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-xl font-mono focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  step={unit === 'metric' ? '0.1' : '0.5'}
                  min="0"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                  {unit === 'metric' ? 'kg' : 'lbs'}
                </span>
              </div>
            </div>

            {/* Height Input */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-red-400" />
                Height
              </label>
              {unit === 'metric' ? (
                <div className="relative">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                    className="w-full pr-16 pl-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-xl font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    step="0.1"
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={feet}
                      onChange={(e) => setFeet(e.target.value)}
                      placeholder="5"
                      className="w-full pr-12 pl-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-xl font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                      min="0"
                      max="8"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={inches}
                      onChange={(e) => setInches(e.target.value)}
                      placeholder="9"
                      className="w-full pr-12 pl-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-xl font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                      min="0"
                      max="11"
                      step="0.5"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Label Input */}
            <div className="mb-8">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (optional)"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Results */}
            {currentBMI && (
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 text-center">BMI Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* BMI Value */}
                    <div className="text-center p-6 bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-xl border border-pink-500/20">
                      <div className="text-gray-400 text-sm mb-2">Your BMI</div>
                      <div className="text-pink-400 font-mono text-4xl font-bold mb-2">
                        {currentBMI.bmi}
                      </div>
                      <div className={`text-lg font-semibold ${getBMICategory(currentBMI.bmi).color}`}>
                        {currentBMI.category}
                      </div>
                    </div>
                    
                    {/* Input Summary */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Weight:</span>
                        <span className="text-white font-mono">{formatWeight(currentBMI.weight, currentBMI.unit)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Height:</span>
                        <span className="text-white font-mono">{formatHeight(currentBMI.height, currentBMI.unit)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Health Range */}
                    <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <div className="text-green-400 font-semibold mb-2">Healthy Weight Range</div>
                      <div className="text-white font-mono text-lg">
                        {formatWeight(currentBMI.healthyWeightRange.min, currentBMI.unit)} - {formatWeight(currentBMI.healthyWeightRange.max, currentBMI.unit)}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        BMI 18.5 - 24.9
                      </div>
                    </div>
                    
                    {/* Category Info */}
                    <div className="p-4 bg-gray-800/30 rounded-xl">
                      <div className="text-gray-400 text-sm mb-1">Health Risk</div>
                      <div className="text-white text-sm">
                        {getBMICategory(currentBMI.bmi).healthRisk}
                      </div>
                    </div>
                    
                    {/* Copy Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyToClipboard(`BMI: ${currentBMI.bmi} (${currentBMI.category})`, 'BMI result')}
                        className="flex-1 py-2 px-3 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-400 text-sm transition-colors flex items-center justify-center"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy BMI
                      </button>
                      <button
                        onClick={() => handleCopyToClipboard(`${formatWeight(currentBMI.healthyWeightRange.min, currentBMI.unit)} - ${formatWeight(currentBMI.healthyWeightRange.max, currentBMI.unit)}`, 'Healthy weight range')}
                        className="flex-1 py-2 px-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-sm transition-colors flex items-center justify-center"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Range
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={handleSaveCalculation}
                    className="flex-1 py-3 px-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white font-semibold rounded-xl hover:from-pink-400 hover:to-pink-500 transition-all hover:scale-105 shadow-lg"
                    disabled={!weight || !currentBMI}
                  >
                    Save Calculation
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-xl text-gray-300 font-semibold transition-all hover:scale-105"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History & BMI Chart */}
        <div className="lg:col-span-1 space-y-6">
          {/* BMI Categories Chart */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-400" />
              BMI Categories
            </h3>
            <div className="space-y-3">
              {bmiCategories.map((category, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${
                    currentBMI && currentBMI.category === category.name
                      ? 'bg-gray-700/50 border-gray-600 ring-2 ring-pink-500/50'
                      : 'bg-gray-800/30 border-gray-700/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-semibold ${category.color}`}>
                      {category.name}
                    </span>
                    <span className="text-gray-400 text-sm font-mono">
                      {category.range}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {category.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-pink-400 rounded-full mr-3 animate-pulse"></span>
              History
            </h3>
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
                    className="bg-gray-800/50 rounded-lg p-3 text-sm hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => loadFromHistory(calc)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-gray-300 font-semibold">{calc.label || 'BMI Calculation'}</span>
                      <span className={`text-sm font-bold ${getBMICategory(calc.bmi).color}`}>
                        {calc.bmi}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 text-xs">
                        {formatWeight(calc.weight, calc.unit)} • {formatHeight(calc.height, calc.unit)}
                      </span>
                      <span className={`text-xs ${getBMICategory(calc.bmi).color}`}>
                        {calc.category}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(calc.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </button>
            )}
          </div>

          {/* Health Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">💡 BMI Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• BMI is a screening tool, not a diagnostic measure</li>
              <li>• Muscle weighs more than fat (athletes may have high BMI)</li>
              <li>• Age, sex, and ethnicity can affect BMI interpretation</li>
              <li>• Consult healthcare providers for personalized advice</li>
              <li>• Focus on overall health, not just the number</li>
              <li>• Regular exercise and balanced diet matter most</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculatorPage;