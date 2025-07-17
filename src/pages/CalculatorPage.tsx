import React, { useState, useEffect } from 'react';
import { Calculator, Delete, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import { checkRateLimit, createRateLimiter } from '../utils/rateLimiter';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { LIMITS, STORAGE_KEYS } from '../utils/constants';
import { validateNumber } from '../utils/validation';

const calculatorLimiter = createRateLimiter({
  maxRequests: 1000,
  windowMs: 60000 // 1000 calculations per minute
});
const CalculatorPage: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useLocalStorage<string[]>(STORAGE_KEYS.calculatorHistory, []);
  const { showSuccess, showError } = useToast();

  const inputNumber = (num: string) => {
    if (display.length >= 15) {
      showError('Maximum number length reached');
      return;
    }
    
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);
    
    try {
      checkRateLimit(calculatorLimiter, 'calculation');
    } catch (error) {
      showError(error.message);
      return;
    }
    
    if (!validateNumber(display)) {
      showError('Invalid number');
      return;
    }

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      
      // Add to history
      const historyEntry = `${currentValue} ${operation} ${inputValue} = ${newValue}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, LIMITS.maxHistoryItems - 1)]);
      
      trackToolUsage('calculator', 'calculation', {
        operation,
        result: newValue
      });
      
      showSuccess('Calculation completed');
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    let result: number;
    
    switch (operation) {
      case '+':
        result = firstValue + secondValue;
        break;
      case '-':
        result = firstValue - secondValue;
        break;
      case '×':
        result = firstValue * secondValue;
        break;
      case '÷':
        if (secondValue === 0) {
          showError('Cannot divide by zero');
          return firstValue;
        }
        result = firstValue / secondValue;
        break;
      case '=':
        result = secondValue;
        break;
      default:
        result = secondValue;
    }
    
    // Check for overflow or invalid results
    if (!isFinite(result)) {
      showError('Result is too large or invalid');
      return firstValue;
    }
    
    // Round to prevent floating point precision issues
    return Math.round(result * Math.pow(10, LIMITS.calculatorPrecision)) / Math.pow(10, LIMITS.calculatorPrecision);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    const { key } = event;
    
    if (key >= '0' && key <= '9') {
      inputNumber(key);
    } else if (key === '.') {
      inputDecimal();
    } else if (key === '+' || key === '-') {
      performOperation(key);
    } else if (key === '*') {
      performOperation('×');
    } else if (key === '/') {
      event.preventDefault();
      performOperation('÷');
    } else if (key === 'Enter' || key === '=') {
      performOperation('=');
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      clear();
    } else if (key === 'Backspace') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [display, operation, previousValue, waitingForOperand]);

  const Button: React.FC<{
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
  }> = ({ onClick, className = '', children }) => (
    <button
      onClick={onClick}
      className={`
        h-16 rounded-xl font-semibold text-lg transition-all duration-200
        hover:scale-105 active:scale-95 shadow-lg
        ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <BackButton />
      <SEOHead 
        title="Calculator"
        description="A powerful calculator with history tracking and keyboard support. Perfect for when your brain needs a math assistant."
        canonical="/calculator"
      />
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          A powerful calculator that remembers what 2+2 equals when your brain doesn't. 
          <span className="text-blue-400"> Math anxiety not included!</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8">
            {/* Display */}
            <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
              <div className="text-right">
                <div className="text-gray-500 text-sm mb-1">
                  {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
                </div>
                <div className="text-4xl font-mono text-white break-all">
                  {display}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-4">
              {/* Row 1 */}
              <Button
                onClick={clear}
                className="bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500"
              >
                <RotateCcw className="w-5 h-5 mx-auto" />
              </Button>
              <Button
                onClick={() => {
                  if (display.length > 1) {
                    setDisplay(display.slice(0, -1));
                  } else {
                    setDisplay('0');
                  }
                }}
                className="bg-gradient-to-br from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600"
              >
                <Delete className="w-5 h-5 mx-auto" />
              </Button>
              <Button
                onClick={() => performOperation('÷')}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500"
              >
                ÷
              </Button>
              <Button
                onClick={() => performOperation('×')}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500"
              >
                ×
              </Button>

              {/* Row 2 */}
              <Button
                onClick={() => inputNumber('7')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              >
                7
              </Button>
              <Button
                onClick={() => inputNumber('8')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              >
                8
              </Button>
              <Button
                onClick={() => inputNumber('9')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              >
                9
              </Button>
              <Button
                onClick={() => performOperation('-')}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500"
              >
                -
              </Button>

              {/* Row 3 */}
              <Button
                onClick={() => inputNumber('4')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              >
                4
              </Button>
              <Button
                onClick={() => inputNumber('5')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              >
                5
              </Button>
              <Button
                onClick={() => inputNumber('6')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              >
                6
              </Button>
              <Button
                onClick={() => performOperation('+')}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500"
              >
                +
              </Button>

              {/* Row 4 */}
              <Button
                onClick={() => inputNumber('1')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              >
                1
              </Button>
              <Button
                onClick={() => inputNumber('2')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              >
                2
              </Button>
              <Button
                onClick={() => inputNumber('3')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              >
                3
              </Button>
              <Button
                onClick={() => performOperation('=')}
                className="bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 row-span-2"
              >
                =
              </Button>

              {/* Row 5 */}
              <Button
                onClick={() => inputNumber('0')}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700 col-span-2"
              >
                0
              </Button>
              <Button
                onClick={inputDecimal}
                className="bg-gradient-to-br from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              >
                .
              </Button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-1">
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
                history.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-lg p-3 text-sm font-mono text-gray-300 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => {
                      const result = entry.split(' = ')[1];
                      setDisplay(result);
                    }}
                  >
                    {entry}
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
          <div className="mt-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">💡 Pro Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Use keyboard for faster input</li>
              <li>• Press 'C' or 'Escape' to clear</li>
              <li>• Click history entries to reuse results</li>
              <li>• Backspace to delete last digit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;