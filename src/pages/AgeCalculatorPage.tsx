import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Calculator, Copy, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ToastContainer';
import { trackToolUsage } from '../utils/analytics';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import DatePicker from '../components/DatePicker';
import { STORAGE_KEYS } from '../utils/constants';

interface AgeCalculation {
  birthDate: Date;
  targetDate: Date;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  timestamp: Date;
  label?: string;
}

interface AgeComparison {
  person1: AgeCalculation;
  person2: AgeCalculation;
  ageDifference: {
    years: number;
    months: number;
    days: number;
    totalDays: number;
  };
}

const AgeCalculatorPage: React.FC = () => {
  const [birthDate, setBirthDate] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [targetTime, setTargetTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  const [includeTime, setIncludeTime] = useState<boolean>(false);
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [label, setLabel] = useState<string>('');
  const [history, setHistory] = useLocalStorage<AgeCalculation[]>(STORAGE_KEYS.ageCalculatorHistory || 'age-calculator-history', []);
  const [comparisons, setComparisons] = useLocalStorage<AgeComparison[]>('age-comparisons', []);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [selectedForComparison, setSelectedForComparison] = useState<AgeCalculation[]>([]);
  const { showSuccess, showError } = useToast();

  // Available timezones (common ones)
  const commonTimezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
    'UTC'
  ];

  // Calculate precise age
  const calculateAge = (birth: Date, target: Date): AgeCalculation => {
    const birthTime = birth.getTime();
    const targetTime = target.getTime();
    
    if (targetTime < birthTime) {
      throw new Error('Target date cannot be before birth date');
    }

    // Calculate total differences
    const totalMilliseconds = targetTime - birthTime;
    const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
    const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
    const totalDays = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));

    // Calculate precise years, months, days
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();
    let hours = target.getHours() - birth.getHours();
    let minutes = target.getMinutes() - birth.getMinutes();

    // Adjust for negative values
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
    
    if (hours < 0) {
      hours += 24;
      days--;
    }

    if (days < 0) {
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }

    if (months < 0) {
      months += 12;
      years--;
    }

    return {
      birthDate: birth,
      targetDate: target,
      years,
      months,
      days,
      hours,
      minutes,
      totalDays,
      totalHours,
      totalMinutes,
      timestamp: new Date(),
      label
    };
  };

  // Get current age calculation
  const getCurrentAge = (): AgeCalculation | null => {
    if (!birthDate) return null;

    try {
      const birth = new Date(`${birthDate}${includeTime ? `T${birthTime}` : 'T12:00'}`);
      const target = new Date(`${targetDate}${includeTime ? `T${targetTime}` : 'T12:00'}`);
      
      return calculateAge(birth, target);
    } catch (error) {
      return null;
    }
  };

  const currentAge = getCurrentAge();

  // Handle leap year calculation
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Format age display
  const formatAge = (age: AgeCalculation): string => {
    const parts = [];
    if (age.years > 0) parts.push(`${age.years} year${age.years !== 1 ? 's' : ''}`);
    if (age.months > 0) parts.push(`${age.months} month${age.months !== 1 ? 's' : ''}`);
    if (age.days > 0) parts.push(`${age.days} day${age.days !== 1 ? 's' : ''}`);
    
    if (includeTime) {
      if (age.hours > 0) parts.push(`${age.hours} hour${age.hours !== 1 ? 's' : ''}`);
      if (age.minutes > 0) parts.push(`${age.minutes} minute${age.minutes !== 1 ? 's' : ''}`);
    }
    
    return parts.join(', ') || '0 days';
  };

  // Save calculation to history
  const handleSaveCalculation = () => {
    if (!currentAge) {
      showError('Please enter a valid birth date');
      return;
    }

    const calculationWithLabel = { ...currentAge, label: label || 'Age Calculation' };
    setHistory(prev => [calculationWithLabel, ...prev.slice(0, 49)]);
    
    trackToolUsage('age-calculator', 'calculation', {
      years: currentAge.years,
      includeTime,
      timezone
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

  // Compare ages
  const handleCompareAges = (age1: AgeCalculation, age2: AgeCalculation) => {
    const older = age1.birthDate < age2.birthDate ? age1 : age2;
    const younger = age1.birthDate < age2.birthDate ? age2 : age1;
    
    const ageDiff = calculateAge(older.birthDate, younger.birthDate);
    
    const comparison: AgeComparison = {
      person1: older,
      person2: younger,
      ageDifference: {
        years: ageDiff.years,
        months: ageDiff.months,
        days: ageDiff.days,
        totalDays: ageDiff.totalDays
      }
    };

    setComparisons(prev => [comparison, ...prev.slice(0, 19)]);
    showSuccess('Age comparison saved');
  };

  // Clear all data
  const clearAll = () => {
    setBirthDate('');
    setTargetDate(new Date().toISOString().split('T')[0]);
    setBirthTime('12:00');
    setTargetTime(new Date().toTimeString().slice(0, 5));
    setLabel('');
    setSelectedForComparison([]);
  };

  // Auto-update current time for real-time age
  useEffect(() => {
    if (targetDate === new Date().toISOString().split('T')[0] && includeTime) {
      const interval = setInterval(() => {
        setTargetTime(new Date().toTimeString().slice(0, 5));
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [targetDate, includeTime]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <BackButton />
      <SEOHead 
        title="Age Calculator - BrainDead"
        description="Calculate precise age down to minutes, compare ages, and handle leap years. Because knowing exactly how old you are matters (sometimes)."
        canonical="/age-calculator"
      />
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-lg">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Age Calculator
        </h1>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-4">
          Find out exactly how old you are (down to the minute). 
          <span className="text-purple-400"> Because existential precision matters!</span>
        </p>
        
        {/* Fun Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
            <span>Leap year aware</span>
          </div>
          <div className="flex items-center text-pink-400">
            <div className="w-2 h-2 bg-pink-400 rounded-full mr-2 animate-pulse"></div>
            <span>Timezone support</span>
          </div>
          <div className="flex items-center text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span>Age comparisons</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Calculator */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6 md:p-8">
            {/* Birth Date Input */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                Birth Date
              </label>
              <div className={`grid gap-4 ${includeTime ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                <DatePicker
                  value={birthDate}
                  onChange={setBirthDate}
                  placeholder="Select birth date"
                  max={new Date().toISOString().split('T')[0]}
                />
                {includeTime && (
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-xl font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
                  />
                )}
              </div>
            </div>

            {/* Target Date Input */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-pink-400" />
                Calculate Age As Of
              </label>
              <div className={`grid gap-4 ${includeTime ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                <DatePicker
                  value={targetDate}
                  onChange={setTargetDate}
                  placeholder="Select target date"
                />
                {includeTime && (
                  <input
                    type="time"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-xl font-mono focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all [color-scheme:dark]"
                  />
                )}
              </div>
            </div>

            {/* Options */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeTime"
                  checked={includeTime}
                  onChange={(e) => setIncludeTime(e.target.checked)}
                  className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="includeTime" className="text-white text-sm">
                  Include precise time (hours and minutes)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Label (optional)"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  {commonTimezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results */}
            {currentAge && (
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Age Calculation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                      <div className="text-gray-400 text-sm mb-1">Precise Age</div>
                      <div className="text-purple-400 font-mono text-lg font-bold">
                        {formatAge(currentAge)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-gray-400 text-xs mb-1">Years</div>
                        <div className="text-white font-mono text-xl">{currentAge.years}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-gray-400 text-xs mb-1">Months</div>
                        <div className="text-white font-mono text-xl">{currentAge.months}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-gray-400 text-xs mb-1">Days</div>
                        <div className="text-white font-mono text-xl">{currentAge.days}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-gray-400 text-xs mb-1">Total Days</div>
                        <div className="text-pink-400 font-mono text-lg">{currentAge.totalDays.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    {includeTime && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                          <div className="text-gray-400 text-xs mb-1">Hours</div>
                          <div className="text-white font-mono text-lg">{currentAge.hours}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                          <div className="text-gray-400 text-xs mb-1">Minutes</div>
                          <div className="text-white font-mono text-lg">{currentAge.minutes}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="text-gray-400 text-xs mb-1">Total Hours</div>
                      <div className="text-blue-400 font-mono text-lg">{currentAge.totalHours.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => handleCopyToClipboard(formatAge(currentAge), 'Age')}
                    className="flex-1 py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Age
                  </button>
                  <button
                    onClick={() => handleCopyToClipboard(`${currentAge.totalDays.toLocaleString()} days`, 'Total days')}
                    className="flex-1 py-2 px-4 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-400 text-sm transition-colors flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Days
                  </button>
                </div>
                
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={handleSaveCalculation}
                    className="flex-1 py-3 px-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-purple-500 transition-all hover:scale-105 shadow-lg"
                    disabled={!birthDate}
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

        {/* History & Comparisons */}
        <div className="lg:col-span-1 space-y-6">
          {/* History */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
                History
              </h3>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showComparison ? 'Hide' : 'Compare'}
              </button>
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
                    className={`bg-gray-800/50 rounded-lg p-3 text-sm transition-colors cursor-pointer ${
                      showComparison && selectedForComparison.includes(calc) 
                        ? 'ring-2 ring-blue-500 bg-blue-500/10' 
                        : 'hover:bg-gray-700/50'
                    }`}
                    onClick={() => {
                      if (showComparison) {
                        if (selectedForComparison.includes(calc)) {
                          setSelectedForComparison(prev => prev.filter(c => c !== calc));
                        } else if (selectedForComparison.length < 2) {
                          setSelectedForComparison(prev => [...prev, calc]);
                        }
                      } else {
                        setBirthDate(calc.birthDate.toISOString().split('T')[0]);
                        setTargetDate(calc.targetDate.toISOString().split('T')[0]);
                        setLabel(calc.label || '');
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-gray-300 font-semibold">{calc.label || 'Age Calculation'}</span>
                      <span className="text-purple-400 text-xs">{calc.years}y {calc.months}m</span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      Born: {calc.birthDate.toLocaleDateString()}
                    </div>
                    <div className="text-gray-400 text-xs">
                      As of: {calc.targetDate.toLocaleDateString()}
                    </div>
                    <div className="text-pink-400 text-xs mt-1">
                      {calc.totalDays.toLocaleString()} days total
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {showComparison && selectedForComparison.length === 2 && (
              <button
                onClick={() => {
                  handleCompareAges(selectedForComparison[0], selectedForComparison[1]);
                  setSelectedForComparison([]);
                }}
                className="w-full mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors"
              >
                Compare Selected Ages
              </button>
            )}
            
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

          {/* Age Comparisons */}
          {comparisons.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Age Comparisons
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comparisons.map((comp, index) => (
                  <div key={index} className="bg-gray-800/30 rounded-lg p-3 text-sm">
                    <div className="text-blue-400 font-semibold mb-2">Age Difference</div>
                    <div className="text-white">
                      {comp.ageDifference.years}y {comp.ageDifference.months}m {comp.ageDifference.days}d
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      ({comp.ageDifference.totalDays.toLocaleString()} days)
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setComparisons([])}
                className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
              >
                Clear Comparisons
              </button>
            </div>
          )}

          {/* Fun Facts */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🎂 Age Facts</h4>
            {currentAge && (
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• You've lived through <strong>{Math.floor(currentAge.totalDays / 365.25)}</strong> calendar years</li>
                <li>• That's approximately <strong>{Math.floor(currentAge.totalHours / 24 / 7).toLocaleString()}</strong> weeks</li>
                <li>• You've experienced <strong>{Math.floor(currentAge.totalDays / 365.25 * 4)}</strong> seasons</li>
                <li>• Born in a {isLeapYear(currentAge.birthDate.getFullYear()) ? 'leap' : 'regular'} year</li>
                {currentAge.years >= 18 && <li>• You've been an adult for <strong>{currentAge.years - 18}</strong> years</li>}
                {currentAge.totalDays > 10000 && <li>• 🎉 You've passed the 10,000 day milestone!</li>}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeCalculatorPage;