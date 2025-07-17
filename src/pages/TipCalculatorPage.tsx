import React, { useState, useEffect } from 'react';
import { Calculator, Users, DollarSign, Percent } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';

interface TipCalculation {
  billAmount: number;
  tipPercentage: number;
  tipAmount: number;
  totalAmount: number;
  splitCount: number;
  perPersonAmount: number;
  timestamp: Date;
}

const TipCalculatorPage: React.FC = () => {
  const [billAmount, setBillAmount] = useState<string>('');
  const [tipPercentage, setTipPercentage] = useState<number>(18);
  const [splitCount, setSplitCount] = useState<number>(1);
  const [customTip, setCustomTip] = useState<string>('');
  const [isCustomTip, setIsCustomTip] = useState<boolean>(false);
  const [history, setHistory] = useLocalStorage<TipCalculation[]>(STORAGE_KEYS.tipCalculatorHistory, []);
  const { showSuccess, showError } = useToast();

  // Predefined tip percentages
  const tipPresets = [10, 15, 18, 20, 22, 25];

  // Calculate tip and total
  const calculateTip = () => {
    const bill = parseFloat(billAmount);
    const tip = isCustomTip ? parseFloat(customTip) : tipPercentage;
    
    if (isNaN(bill) || bill <= 0) {
      return {
        tipAmount: 0,
        totalAmount: 0,
        perPersonAmount: 0
      };
    }

    if (isNaN(tip) || tip < 0) {
      return {
        tipAmount: 0,
        totalAmount: bill,
        perPersonAmount: bill / splitCount
      };
    }

    const tipAmount = (bill * tip) / 100;
    const totalAmount = bill + tipAmount;
    const perPersonAmount = totalAmount / splitCount;

    return {
      tipAmount: Math.round(tipAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      perPersonAmount: Math.round(perPersonAmount * 100) / 100
    };
  };

  const { tipAmount, totalAmount, perPersonAmount } = calculateTip();

  const handleSaveCalculation = () => {
    const bill = parseFloat(billAmount);
    const tip = isCustomTip ? parseFloat(customTip) : tipPercentage;
    
    if (isNaN(bill) || bill <= 0) {
      showError('Please enter a valid bill amount');
      return;
    }

    const calculation: TipCalculation = {
      billAmount: bill,
      tipPercentage: tip,
      tipAmount,
      totalAmount,
      splitCount,
      perPersonAmount,
      timestamp: new Date()
    };

    setHistory(prev => [calculation, ...prev.slice(0, 49)]); // Keep last 50 calculations
    
    trackToolUsage('tip-calculator', 'calculation', {
      billAmount: bill,
      tipPercentage: tip,
      splitCount,
      totalAmount
    });
    
    showSuccess('Calculation saved to history');
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`${label} copied to clipboard!`);
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleTipPresetClick = (percentage: number) => {
    setTipPercentage(percentage);
    setIsCustomTip(false);
    setCustomTip('');
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    setIsCustomTip(true);
  };

  const clearAll = () => {
    setBillAmount('');
    setTipPercentage(18);
    setSplitCount(1);
    setCustomTip('');
    setIsCustomTip(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <BackButton />
      <SEOHead 
        title="Tip Calculator - BrainDead"
        description="Calculate tips and split bills effortlessly. No more awkward math at restaurants or wondering if 18% is too much."
        canonical="/tip-calculator"
      />
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Tip Calculator
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4">
          Calculate tips without looking cheap or overpaying. 
          <span className="text-green-400"> Math anxiety at restaurants is now optional!</span>
        </p>
        
        {/* Fun Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span>Bill splitting enabled</span>
          </div>
          <div className="flex items-center text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span>Custom tip percentages</span>
          </div>
          <div className="flex items-center text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
            <span>No more napkin math</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Calculator */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8">
            {/* Bill Amount Input */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                Bill Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">$</span>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-xl font-mono focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Tip Percentage */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                <Percent className="w-5 h-5 mr-2 text-blue-400" />
                Tip Percentage
              </label>
              
              {/* Preset Buttons */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                {tipPresets.map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => handleTipPresetClick(percentage)}
                    className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                      !isCustomTip && tipPercentage === percentage
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                    }`}
                  >
                    {percentage}%
                  </button>
                ))}
              </div>

              {/* Custom Tip Input */}
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm">Custom:</span>
                <div className="relative flex-1 max-w-32">
                  <input
                    type="number"
                    value={customTip}
                    onChange={(e) => handleCustomTipChange(e.target.value)}
                    placeholder="0"
                    className={`w-full pr-8 pl-3 py-2 bg-gray-800/50 border rounded-lg text-white font-mono focus:ring-2 transition-all ${
                      isCustomTip 
                        ? 'border-blue-500 focus:ring-blue-500/20' 
                        : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>

            {/* Split Count */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                Split Between
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                  className="w-12 h-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-bold hover:bg-gray-700/50 transition-all hover:scale-105"
                  disabled={splitCount <= 1}
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-white">{splitCount}</div>
                  <div className="text-sm text-gray-400">
                    {splitCount === 1 ? 'person' : 'people'}
                  </div>
                </div>
                <button
                  onClick={() => setSplitCount(Math.min(20, splitCount + 1))}
                  className="w-12 h-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-bold hover:bg-gray-700/50 transition-all hover:scale-105"
                  disabled={splitCount >= 20}
                >
                  +
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Calculation Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                    <span className="text-gray-400">Bill Amount:</span>
                    <span className="text-white font-mono text-lg">{formatCurrency(parseFloat(billAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                    <span className="text-gray-400">Tip ({isCustomTip ? parseFloat(customTip) || 0 : tipPercentage}%):</span>
                    <span className="text-green-400 font-mono text-lg">{formatCurrency(tipAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                    <span className="text-gray-400 font-semibold">Total Amount:</span>
                    <span className="text-blue-400 font-mono text-xl font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                    <div className="text-gray-400 text-sm mb-1">Per Person</div>
                    <div className="text-purple-400 font-mono text-2xl font-bold">{formatCurrency(perPersonAmount)}</div>
                    {splitCount > 1 && (
                      <div className="text-gray-500 text-xs mt-1">Split {splitCount} ways</div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopyToClipboard(formatCurrency(totalAmount), 'Total amount')}
                      className="flex-1 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors"
                    >
                      Copy Total
                    </button>
                    <button
                      onClick={() => handleCopyToClipboard(formatCurrency(perPersonAmount), 'Per person amount')}
                      className="flex-1 py-2 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors"
                    >
                      Copy Per Person
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleSaveCalculation}
                  className="flex-1 py-3 px-6 bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-400 hover:to-green-500 transition-all hover:scale-105 shadow-lg"
                  disabled={!billAmount || parseFloat(billAmount) <= 0}
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
          </div>
        </div>

        {/* History & Tips */}
        <div className="lg:col-span-1 space-y-6">
          {/* History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
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
                    onClick={() => {
                      setBillAmount(calc.billAmount.toString());
                      setTipPercentage(calc.tipPercentage);
                      setSplitCount(calc.splitCount);
                      setIsCustomTip(!tipPresets.includes(calc.tipPercentage));
                      if (!tipPresets.includes(calc.tipPercentage)) {
                        setCustomTip(calc.tipPercentage.toString());
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-gray-300 font-mono">{formatCurrency(calc.billAmount)}</span>
                      <span className="text-green-400 text-xs">{calc.tipPercentage}% tip</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-400 font-mono font-bold">{formatCurrency(calc.totalAmount)}</span>
                      {calc.splitCount > 1 && (
                        <span className="text-purple-400 text-xs">÷{calc.splitCount}</span>
                      )}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {new Date(calc.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">💡 Tipping Guide</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• <strong>Restaurants:</strong> 18-22% for good service</li>
              <li>• <strong>Bars:</strong> $1-2 per drink or 15-20%</li>
              <li>• <strong>Delivery:</strong> 15-20% (minimum $3)</li>
              <li>• <strong>Takeout:</strong> 10% is appreciated</li>
              <li>• <strong>Poor service:</strong> 10-15% minimum</li>
              <li>• <strong>Exceptional:</strong> 25%+ shows appreciation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipCalculatorPage;