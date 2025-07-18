import React, { useState, useEffect } from 'react';
import { Calculator, Delete, RotateCcw, History, Copy, Download } from 'lucide-react';
import ToolLayout from '../components/shared/ToolLayout';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import { STORAGE_KEYS } from '../utils/constants';
import { validateNumberEnhanced } from '../utils/validation';
import SEOContent from '../components/SEOContent';

interface CalculationHistory {
  expression: string;
  result: string;
  timestamp: Date;
}

const CalculatorPage: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useLocalStorage<CalculationHistory[]>(STORAGE_KEYS.calculatorHistory, []);
  const [showHistory, setShowHistory] = useState(false);
  const [memory, setMemory] = useState(0);
  const { showSuccess, showError, showWarning } = useToast();

  // Check for integration data on mount
  useEffect(() => {
    const integrationData = sessionStorage.getItem('tool-integration-calculator');
    if (integrationData) {
      try {
        const parsed = JSON.parse(integrationData);
        if (parsed.data && typeof parsed.data === 'number') {
          setDisplay(String(parsed.data));
          showSuccess('Number integrated from ' + parsed.sourceToolId);
        }
        sessionStorage.removeItem('tool-integration-calculator');
      } catch (error) {
        console.warn('Failed to load integration data:', error);
      }
    }
  }, [showSuccess]);

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
    setExpression('');
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperation?: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(display);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result: number;

      try {
        switch (operation) {
          case '+':
            result = currentValue + inputValue;
            break;
          case '-':
            result = currentValue - inputValue;
            break;
          case '×':
            result = currentValue * inputValue;
            break;
          case '÷':
            if (inputValue === 0) {
              showError('Cannot divide by zero');
              return;
            }
            result = currentValue / inputValue;
            break;
          case '%':
            result = currentValue % inputValue;
            break;
          case '^':
            result = Math.pow(currentValue, inputValue);
            break;
          default:
            return;
        }

        // Check for overflow or invalid results
        if (!isFinite(result)) {
          showError('Result is too large or invalid');
          clear();
          return;
        }

        const fullExpression = `${expression} ${operation} ${display}`;
        const resultStr = formatResult(result);
        
        // Add to history
        const historyEntry: CalculationHistory = {
          expression: fullExpression,
          result: resultStr,
          timestamp: new Date()
        };
        
        setHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
        
        setDisplay(resultStr);
        setPreviousValue(result);
        setExpression(fullExpression);

        trackToolUsage('calculator', { operation, result: resultStr });
      } catch (error) {
        showError('Calculation error');
        clear();
        return;
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation || null);
  };

  const formatResult = (num: number): string => {
    // Handle very large or very small numbers
    if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(6);
    }
    
    // Format with appropriate decimal places
    const str = num.toString();
    if (str.length > 12) {
      return parseFloat(num.toPrecision(12)).toString();
    }
    
    return str;
  };

  const calculate = () => {
    performOperation();
  };

  const handleScientificFunction = (func: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    try {
      switch (func) {
        case 'sin':
          result = Math.sin(inputValue * Math.PI / 180); // Convert to radians
          break;
        case 'cos':
          result = Math.cos(inputValue * Math.PI / 180);
          break;
        case 'tan':
          result = Math.tan(inputValue * Math.PI / 180);
          break;
        case 'log':
          if (inputValue <= 0) {
            showError('Logarithm of non-positive number');
            return;
          }
          result = Math.log10(inputValue);
          break;
        case 'ln':
          if (inputValue <= 0) {
            showError('Natural logarithm of non-positive number');
            return;
          }
          result = Math.log(inputValue);
          break;
        case 'sqrt':
          if (inputValue < 0) {
            showError('Square root of negative number');
            return;
          }
          result = Math.sqrt(inputValue);
          break;
        case '1/x':
          if (inputValue === 0) {
            showError('Cannot divide by zero');
            return;
          }
          result = 1 / inputValue;
          break;
        case 'x²':
          result = inputValue * inputValue;
          break;
        case '±':
          result = -inputValue;
          break;
        default:
          return;
      }

      const resultStr = formatResult(result);
      const historyEntry: CalculationHistory = {
        expression: `${func}(${display})`,
        result: resultStr,
        timestamp: new Date()
      };
      
      setHistory(prev => [historyEntry, ...prev.slice(0, 49)]);
      setDisplay(resultStr);
      setWaitingForOperand(true);
    } catch (error) {
      showError('Calculation error');
    }
  };

  const handleMemoryOperation = (op: string) => {
    const currentValue = parseFloat(display);
    
    switch (op) {
      case 'MC':
        setMemory(0);
        showSuccess('Memory cleared');
        break;
      case 'MR':
        setDisplay(formatResult(memory));
        setWaitingForOperand(true);
        break;
      case 'M+':
        setMemory(prev => prev + currentValue);
        showSuccess('Added to memory');
        break;
      case 'M-':
        setMemory(prev => prev - currentValue);
        showSuccess('Subtracted from memory');
        break;
      case 'MS':
        setMemory(currentValue);
        showSuccess('Stored in memory');
        break;
    }
  };

  const handleExport = (format: string) => {
    if (history.length === 0) return;

    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(history, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'csv':
        const csvRows = [
          'Expression,Result,Timestamp',
          ...history.map(h => `"${h.expression}","${h.result}","${h.timestamp.toISOString()}"`)
        ];
        content = csvRows.join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'txt':
        content = history
          .map(h => `${h.expression} = ${h.result} (${h.timestamp.toLocaleString()})`)
          .join('\n');
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calculator-history-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBatchProcess = async (input: string): Promise<string> => {
    try {
      // Simple expression evaluation for batch processing
      const sanitized = input.replace(/[^0-9+\-*/().\s]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      
      if (!isFinite(result)) {
        throw new Error('Invalid result');
      }
      
      return formatResult(result);
    } catch (error) {
      throw new Error(`Calculation failed: ${error instanceof Error ? error.message : 'Invalid expression'}`);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    showSuccess('History cleared');
  };

  const copyResult = () => {
    navigator.clipboard.writeText(display);
    showSuccess('Result copied to clipboard');
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with input fields
      }

      switch (e.key) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          inputNumber(e.key);
          break;
        case '.':
          inputDecimal();
          break;
        case '+':
          performOperation('+');
          break;
        case '-':
          performOperation('-');
          break;
        case '*':
          performOperation('×');
          break;
        case '/':
          e.preventDefault();
          performOperation('÷');
          break;
        case '%':
          performOperation('%');
          break;
        case '=':
        case 'Enter':
          e.preventDefault();
          calculate();
          break;
        case 'Escape':
          clear();
          break;
        case 'Backspace':
          backspace();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, operation, previousValue, waitingForOperand]);

  const buttonClass = "h-12 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
  const numberButtonClass = `${buttonClass} bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100`;
  const operatorButtonClass = `${buttonClass} bg-blue-600 hover:bg-blue-700 text-white`;
  const functionButtonClass = `${buttonClass} bg-purple-600 hover:bg-purple-700 text-white`;
  const memoryButtonClass = `${buttonClass} bg-green-600 hover:bg-green-700 text-white text-sm`;

  return (
    <ToolLayout
      toolId="calculator"
      title="Enhanced Calculator"
      description="Advanced calculator with scientific functions, memory operations, and calculation history"
      outputData={parseFloat(display)}
      onExport={handleExport}
      onBatchProcess={handleBatchProcess}
      batchInputPlaceholder="Enter mathematical expressions, one per line (e.g., 2+2, 5*3)"
      showBatchOperations={true}
    >
      <div className="p-6 space-y-6">
        {/* Display */}
        <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-right">
            {expression && (
              <div className="text-sm text-gray-400 mb-1 font-mono">
                {expression}
              </div>
            )}
            <div className="text-3xl font-mono text-white break-all">
              {display}
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-400">
              {memory !== 0 && `Memory: ${formatResult(memory)}`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyResult}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <History className="w-3 h-3" />
                History
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calculator Buttons */}
          <div className="lg:col-span-3 space-y-4">
            {/* Memory Operations */}
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleMemoryOperation('MC')} className={memoryButtonClass}>MC</button>
              <button onClick={() => handleMemoryOperation('MR')} className={memoryButtonClass}>MR</button>
              <button onClick={() => handleMemoryOperation('M+')} className={memoryButtonClass}>M+</button>
              <button onClick={() => handleMemoryOperation('M-')} className={memoryButtonClass}>M-</button>
              <button onClick={() => handleMemoryOperation('MS')} className={memoryButtonClass}>MS</button>
            </div>

            {/* Scientific Functions */}
            <div className="grid grid-cols-6 gap-2">
              <button onClick={() => handleScientificFunction('sin')} className={functionButtonClass}>sin</button>
              <button onClick={() => handleScientificFunction('cos')} className={functionButtonClass}>cos</button>
              <button onClick={() => handleScientificFunction('tan')} className={functionButtonClass}>tan</button>
              <button onClick={() => handleScientificFunction('log')} className={functionButtonClass}>log</button>
              <button onClick={() => handleScientificFunction('ln')} className={functionButtonClass}>ln</button>
              <button onClick={() => handleScientificFunction('sqrt')} className={functionButtonClass}>√</button>
            </div>

            <div className="grid grid-cols-6 gap-2">
              <button onClick={() => handleScientificFunction('1/x')} className={functionButtonClass}>1/x</button>
              <button onClick={() => handleScientificFunction('x²')} className={functionButtonClass}>x²</button>
              <button onClick={() => performOperation('^')} className={functionButtonClass}>x^y</button>
              <button onClick={() => performOperation('%')} className={functionButtonClass}>%</button>
              <button onClick={() => handleScientificFunction('±')} className={functionButtonClass}>±</button>
              <button onClick={clear} className={`${buttonClass} bg-red-600 hover:bg-red-700 text-white`}>C</button>
            </div>

            {/* Main Calculator */}
            <div className="grid grid-cols-4 gap-2">
              <button onClick={clearEntry} className={`${buttonClass} bg-orange-600 hover:bg-orange-700 text-white`}>CE</button>
              <button onClick={backspace} className={`${buttonClass} bg-orange-600 hover:bg-orange-700 text-white`}>
                <Delete className="w-4 h-4 mx-auto" />
              </button>
              <button onClick={() => performOperation('÷')} className={operatorButtonClass}>÷</button>
              <button onClick={() => performOperation('×')} className={operatorButtonClass}>×</button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => inputNumber('7')} className={numberButtonClass}>7</button>
              <button onClick={() => inputNumber('8')} className={numberButtonClass}>8</button>
              <button onClick={() => inputNumber('9')} className={numberButtonClass}>9</button>
              <button onClick={() => performOperation('-')} className={operatorButtonClass}>-</button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => inputNumber('4')} className={numberButtonClass}>4</button>
              <button onClick={() => inputNumber('5')} className={numberButtonClass}>5</button>
              <button onClick={() => inputNumber('6')} className={numberButtonClass}>6</button>
              <button onClick={() => performOperation('+')} className={operatorButtonClass}>+</button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => inputNumber('1')} className={numberButtonClass}>1</button>
              <button onClick={() => inputNumber('2')} className={numberButtonClass}>2</button>
              <button onClick={() => inputNumber('3')} className={numberButtonClass}>3</button>
              <button onClick={calculate} className={`${operatorButtonClass} row-span-2`}>=</button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => inputNumber('0')} className={`${numberButtonClass} col-span-2`}>0</button>
              <button onClick={inputDecimal} className={numberButtonClass}>.</button>
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  History
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Clear
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {history.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No calculations yet
                  </p>
                ) : (
                  history.map((entry, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => {
                        setDisplay(entry.result);
                        setWaitingForOperand(true);
                      }}
                    >
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {entry.expression}
                      </div>
                      <div className="font-mono text-gray-900 dark:text-gray-100">
                        = {entry.result}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            ⌨️ Keyboard Shortcuts
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-700 dark:text-blue-300">
            <div>Numbers: 0-9</div>
            <div>Operators: + - * /</div>
            <div>Decimal: .</div>
            <div>Calculate: Enter or =</div>
            <div>Clear: Escape</div>
            <div>Backspace: ⌫</div>
            <div>Percent: %</div>
            <div>Memory: M keys</div>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <SEOContent type="tool" toolId="calculator" />
    </ToolLayout>
  );
};

export default CalculatorPage;