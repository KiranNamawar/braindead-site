import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

interface TimeProductivityPreviewProps {
  isActive: boolean;
}

const TimeProductivityPreview: React.FC<TimeProductivityPreviewProps> = ({ isActive }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Switch modes when timer completes
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60); // 5 minute break
      } else {
        setMode('work');
        setTimeLeft(25 * 60); // 25 minute work session
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const progress = mode === 'work' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-orange-400" />
        <span className="text-white font-medium">Pomodoro Timer Preview</span>
      </div>
      
      {/* Timer Display */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${
          mode === 'work' 
            ? 'border-orange-500 bg-orange-500/10' 
            : 'border-green-500 bg-green-500/10'
        } transition-all duration-300`}>
          <div className="text-center">
            <div className="text-3xl font-bold text-white font-mono">
              {formatTime(timeLeft)}
            </div>
            <div className={`text-sm ${mode === 'work' ? 'text-orange-400' : 'text-green-400'}`}>
              {mode === 'work' ? 'Focus Time' : 'Break Time'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${
            mode === 'work' 
              ? 'bg-gradient-to-r from-orange-500 to-red-500' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={toggleTimer}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        
        <button
          onClick={resetTimer}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => {
            setMode('work');
            setTimeLeft(25 * 60);
            setIsRunning(false);
          }}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            mode === 'work'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Work (25m)
        </button>
        <button
          onClick={() => {
            setMode('break');
            setTimeLeft(5 * 60);
            setIsRunning(false);
          }}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            mode === 'break'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Break (5m)
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 italic">
          "Procrastinate more efficiently with timed focus sessions"
        </p>
      </div>
    </div>
  );
};

export default TimeProductivityPreview;