import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Calendar, Percent, TrendingDown, FileText } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import { STORAGE_KEYS } from '../utils/constants';

interface LoanCalculation {
  principal: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  timestamp: Date;
}

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const LoanCalculatorPage: React.FC = () => {
  const [principal, setPrincipal] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [termYears, setTermYears] = useState<string>('');
  const [history, setHistory] = useLocalStorage<LoanCalculation[]>(STORAGE_KEYS.loanCalculatorHistory, []);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const { showSuccess, showError } = useToast();

  // Calculate loan payment using standard formula
  const calculateLoan = () => {
    const P = parseFloat(principal);
    const r = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const n = parseFloat(termYears) * 12; // Total number of payments

    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || r < 0 || n <= 0) {
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0
      };
    }

    // Handle zero interest rate case
    if (r === 0) {
      const monthlyPayment = P / n;
      return {
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalPayment: Math.round(P * 100) / 100,
        totalInterest: 0
      };
    }

    // Standard loan payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100
    };
  };

  const { monthlyPayment, totalPayment, totalInterest } = calculateLoan();

  // Generate amortization schedule
  const generateAmortizationSchedule = (): AmortizationEntry[] => {
    const P = parseFloat(principal);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseFloat(termYears) * 12;

    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || r < 0 || n <= 0) {
      return [];
    }

    const schedule: AmortizationEntry[] = [];
    let remainingBalance = P;

    for (let month = 1; month <= n; month++) {
      const interestPayment = remainingBalance * r;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      // Ensure balance doesn't go negative due to rounding
      if (remainingBalance < 0.01) {
        remainingBalance = 0;
      }

      schedule.push({
        month,
        payment: Math.round(monthlyPayment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.round(remainingBalance * 100) / 100
      });
    }

    return schedule;
  };

  const handleSaveCalculation = () => {
    const P = parseFloat(principal);
    const rate = parseFloat(interestRate);
    const years = parseFloat(termYears);

    if (isNaN(P) || isNaN(rate) || isNaN(years) || P <= 0 || rate < 0 || years <= 0) {
      showError('Please enter valid loan parameters');
      return;
    }

    const calculation: LoanCalculation = {
      principal: P,
      interestRate: rate,
      termYears: years,
      monthlyPayment,
      totalPayment,
      totalInterest,
      timestamp: new Date()
    };

    setHistory(prev => [calculation, ...prev.slice(0, 49)]); // Keep last 50 calculations
    
    trackToolUsage('loan-calculator', 'calculation', {
      principal: P,
      interestRate: rate,
      termYears: years,
      monthlyPayment,
      totalPayment
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

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const clearAll = () => {
    setPrincipal('');
    setInterestRate('');
    setTermYears('');
    setShowAmortization(false);
  };

  const exportAmortizationSchedule = () => {
    const schedule = generateAmortizationSchedule();
    if (schedule.length === 0) {
      showError('Please enter valid loan parameters first');
      return;
    }

    const csvContent = [
      'Month,Payment,Principal,Interest,Remaining Balance',
      ...schedule.map(entry => 
        `${entry.month},${entry.payment},${entry.principal},${entry.interest},${entry.balance}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan-amortization-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess('Amortization schedule exported as CSV');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <BackButton />
      <SEOHead 
        title="Loan Calculator - BrainDead"
        description="Calculate loan payments and generate amortization schedules. See how broke you'll be for the next 30 years with detailed payment breakdowns."
        canonical="/loan-calculator"
      />
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Loan Calculator
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4">
          See how broke you'll be for the next 30 years.
          <span className="text-blue-400"> Complete with payment breakdowns and amortization schedules!</span>
        </p>
        
        {/* Fun Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span>Payment calculations</span>
          </div>
          <div className="flex items-center text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
            <span>Amortization schedules</span>
          </div>
          <div className="flex items-center text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span>Interest breakdown</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Calculator */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8">
            {/* Loan Amount Input */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-blue-400" />
                Loan Amount (Principal)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">$</span>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  placeholder="250000"
                  className="w-full pl-8 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-xl font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  step="1000"
                  min="0"
                />
              </div>
            </div>

            {/* Interest Rate Input */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                <Percent className="w-5 h-5 mr-2 text-purple-400" />
                Annual Interest Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="6.5"
                  className="w-full pr-8 pl-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-xl font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  step="0.1"
                  min="0"
                  max="50"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">%</span>
              </div>
            </div>

            {/* Loan Term Input */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-400" />
                Loan Term
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={termYears}
                  onChange={(e) => setTermYears(e.target.value)}
                  placeholder="30"
                  className="w-full pr-16 pl-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-xl font-mono focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  step="1"
                  min="1"
                  max="50"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">years</span>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Payment Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/20">
                    <div className="text-gray-400 text-sm mb-1">Monthly Payment</div>
                    <div className="text-blue-400 font-mono text-2xl font-bold">{formatCurrency(monthlyPayment)}</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                    <span className="text-gray-400">Principal:</span>
                    <span className="text-white font-mono text-lg">{formatCurrency(parseFloat(principal) || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                    <span className="text-gray-400">Interest Rate:</span>
                    <span className="text-purple-400 font-mono text-lg">{parseFloat(interestRate) || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                    <span className="text-gray-400">Loan Term:</span>
                    <span className="text-green-400 font-mono text-lg">{parseFloat(termYears) || 0} years</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20">
                    <div className="text-gray-400 text-sm mb-1">Total Interest</div>
                    <div className="text-red-400 font-mono text-2xl font-bold">{formatCurrency(totalInterest)}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                    <div className="text-gray-400 text-sm mb-1">Total Payment</div>
                    <div className="text-purple-400 font-mono text-xl font-bold">{formatCurrency(totalPayment)}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopyToClipboard(formatCurrency(monthlyPayment), 'Monthly payment')}
                      className="flex-1 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors"
                    >
                      Copy Monthly
                    </button>
                    <button
                      onClick={() => handleCopyToClipboard(formatCurrency(totalPayment), 'Total payment')}
                      className="flex-1 py-2 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors"
                    >
                      Copy Total
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleSaveCalculation}
                  className="flex-1 py-3 px-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-blue-500 transition-all hover:scale-105 shadow-lg"
                  disabled={!principal || !interestRate || !termYears || parseFloat(principal) <= 0}
                >
                  Save Calculation
                </button>
                <button
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-400 font-semibold transition-all hover:scale-105"
                  disabled={!principal || !interestRate || !termYears || parseFloat(principal) <= 0}
                >
                  {showAmortization ? 'Hide' : 'Show'} Schedule
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

          {/* Amortization Schedule */}
          {showAmortization && (
            <div className="mt-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-400" />
                  Amortization Schedule
                </h3>
                <button
                  onClick={exportAmortizationSchedule}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-sm transition-colors"
                >
                  Export CSV
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-800/80 backdrop-blur-sm">
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300 font-semibold">Month</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-semibold">Payment</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-semibold">Principal</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-semibold">Interest</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateAmortizationSchedule().map((entry, index) => (
                        <tr 
                          key={entry.month} 
                          className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                            index % 12 === 11 ? 'bg-gray-800/20' : ''
                          }`}
                        >
                          <td className="py-2 px-4 text-gray-300 font-mono">{entry.month}</td>
                          <td className="py-2 px-4 text-right text-blue-400 font-mono">{formatCurrency(entry.payment)}</td>
                          <td className="py-2 px-4 text-right text-green-400 font-mono">{formatCurrency(entry.principal)}</td>
                          <td className="py-2 px-4 text-right text-red-400 font-mono">{formatCurrency(entry.interest)}</td>
                          <td className="py-2 px-4 text-right text-white font-mono">{formatCurrency(entry.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History & Tips */}
        <div className="lg:col-span-1 space-y-6">
          {/* History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
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
                      setPrincipal(calc.principal.toString());
                      setInterestRate(calc.interestRate.toString());
                      setTermYears(calc.termYears.toString());
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-gray-300 font-mono">{formatCurrency(calc.principal)}</span>
                      <span className="text-purple-400 text-xs">{calc.interestRate}% • {calc.termYears}y</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-blue-400 font-mono font-bold">{formatCurrency(calc.monthlyPayment)}/mo</span>
                      <span className="text-red-400 text-xs">+{formatCurrency(calc.totalInterest)} interest</span>
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
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Loan Tips */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">💡 Loan Tips</h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• <strong>Lower rate:</strong> Even 0.5% less saves thousands</li>
              <li>• <strong>Shorter term:</strong> Pay less interest overall</li>
              <li>• <strong>Extra payments:</strong> Apply directly to principal</li>
              <li>• <strong>20% down:</strong> Avoid PMI on mortgages</li>
              <li>• <strong>Shop around:</strong> Rates vary between lenders</li>
              <li>• <strong>Credit score:</strong> Higher score = better rates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculatorPage;